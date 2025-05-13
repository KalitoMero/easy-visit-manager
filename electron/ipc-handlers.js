
const fs = require('fs');
const { dialog } = require('electron');
const { printToPDF } = require('./printerUtils');
const stores = require('./stores');

// IPC handlers for printer operations
function setupPrinterHandlers(ipcMain, mainWindow) {
  ipcMain.handle('get-printers', async () => {
    return mainWindow.webContents.getPrinters();
  });

  ipcMain.handle('print-badge', async (event, visitorData) => {
    try {
      const settings = stores.printerStore.get('printerSettings', {
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
}

// IPC handlers for data storage
function setupDataStoreHandlers(ipcMain) {
  ipcMain.handle('get-store-data', (event, storeName) => {
    const store = stores.getStoreByName(storeName);
    if (store) {
      switch (storeName) {
        case 'printer-settings':
          return store.get('printerSettings');
        case 'visitor-storage':
          return store.get('visitors');
        case 'policy-storage':
          return store.get('policy');
        case 'admin-auth-storage':
          return store.get('auth');
        case 'language-storage':
          return store.get('language');
        default:
          return null;
      }
    }
    return null;
  });

  ipcMain.handle('set-store-data', (event, storeName, key, data) => {
    const store = stores.getStoreByName(storeName);
    if (store) {
      store.set(key, data);
      return true;
    }
    return false;
  });
}

// IPC handlers for import/export operations
function setupFileOperationHandlers(ipcMain) {
  ipcMain.handle('export-visitors', async () => {
    try {
      const visitors = stores.visitorStore.get('visitors', []);
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
        stores.visitorStore.set('visitors', visitors);
        return { success: true, visitors };
      }
      return { success: false, message: 'Import abgebrochen' };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, message: error.message };
    }
  });
}

// Setup all IPC handlers
function setupIpcHandlers(ipcMain, mainWindow) {
  setupPrinterHandlers(ipcMain, mainWindow);
  setupDataStoreHandlers(ipcMain);
  setupFileOperationHandlers(ipcMain);
}

module.exports = {
  setupIpcHandlers
};
