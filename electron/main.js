const { app, BrowserWindow, ipcMain, Menu, dialog, shell, screen } = require('electron');
const path = require('path');
const url = require('url');
const Store = require('electron-store');
const fs = require('fs');
const { printToPDF } = require('./printerUtils');

// Initialize stores for app settings
const printerStore = new Store({ name: 'printer-settings' });
const visitorStore = new Store({ name: 'visitor-storage' });
const policyStore = new Store({ name: 'policy-storage' });
const adminStore = new Store({ name: 'admin-auth-storage' });
const languageStore = new Store({ name: 'language-storage' });

// Keep a global reference of the window object
let mainWindow;
let isDevelopment = process.env.NODE_ENV === 'development';

const createWindow = () => {
  // Get screen dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    // For kiosk-like applications
    fullscreenable: true,
    autoHideMenuBar: true,
  });

  // Load the app
  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  // Initialize menu
  const menuTemplate = [
    {
      label: 'Datei',
      submenu: [
        { role: 'quit', label: 'Beenden' }
      ]
    },
    {
      label: 'Ansicht',
      submenu: [
        { role: 'reload', label: 'Neu laden' },
        { role: 'togglefullscreen', label: 'Vollbild' },
        { 
          label: 'Kiosk-Modus', 
          type: 'checkbox',
          click: (menuItem) => {
            mainWindow.setKiosk(menuItem.checked);
          }
        },
        { 
          label: 'Developer Tools', 
          accelerator: 'F12',
          click: () => { mainWindow.webContents.toggleDevTools(); },
          visible: isDevelopment
        },
      ]
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it is common for applications to stay open
  // until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window when
  // the dock icon is clicked and there are no other
  // windows open
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC communication for printer functionality
ipcMain.handle('get-printers', async () => {
  return mainWindow.webContents.getPrinters();
});

ipcMain.handle('print-badge', async (event, visitorData) => {
  try {
    const settings = printerStore.get('printerSettings', {
      printerName: null, // Use default printer if null
      silent: true,
      printBackground: true,
      deviceName: '',
      copies: 1
    });
    
    const result = await printToPDF(mainWindow, `/print-badge/${visitorData.id}`, settings);
    return { success: true, message: 'Badge printed successfully' };
  } catch (error) {
    console.error('Printing error:', error);
    return { success: false, message: error.message };
  }
});

// Data storage IPC handlers
ipcMain.handle('get-store-data', (event, storeName) => {
  switch (storeName) {
    case 'printer-settings':
      return printerStore.get('printerSettings');
    case 'visitor-storage':
      return visitorStore.get('visitors');
    case 'policy-storage':
      return policyStore.get('policy');
    case 'admin-auth-storage':
      return adminStore.get('auth');
    case 'language-storage':
      return languageStore.get('language');
    default:
      return null;
  }
});

ipcMain.handle('set-store-data', (event, storeName, key, data) => {
  switch (storeName) {
    case 'printer-settings':
      printerStore.set(key, data);
      break;
    case 'visitor-storage':
      visitorStore.set(key, data);
      break;
    case 'policy-storage':
      policyStore.set(key, data);
      break;
    case 'admin-auth-storage':
      adminStore.set(key, data);
      break;
    case 'language-storage':
      languageStore.set(key, data);
      break;
  }
  return true;
});

// Export visitor data
ipcMain.handle('export-visitors', async () => {
  try {
    const visitors = visitorStore.get('visitors', []);
    const savePath = await dialog.showSaveDialog({
      title: 'Besucherdaten exportieren',
      defaultPath: 'besucherdaten.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    
    if (!savePath.canceled) {
      fs.writeFileSync(savePath.filePath, JSON.stringify(visitors, null, 2));
      return { success: true, path: savePath.filePath };
    }
    return { success: false, message: 'Export abgebrochen' };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, message: error.message };
  }
});

// Import visitor data
ipcMain.handle('import-visitors', async () => {
  try {
    const result = await dialog.showOpenDialog({
      title: 'Besucherdaten importieren',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      const data = fs.readFileSync(result.filePaths[0], 'utf8');
      const visitors = JSON.parse(data);
      visitorStore.set('visitors', visitors);
      return { success: true, visitors };
    }
    return { success: false, message: 'Import abgebrochen' };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, message: error.message };
  }
});
