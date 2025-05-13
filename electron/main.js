
import { app, ipcMain } from 'electron';
import { createMainWindow } from './window.js';
import { setupAppMenu } from './menu.js';
import { setupIpcHandlers } from './ipc-handlers.js';

// Development flag
const isDevelopment = process.env.NODE_ENV === 'development';

// Keep a global reference of the window object
let mainWindow;

const createWindow = () => {
  // Create the browser window
  mainWindow = createMainWindow(isDevelopment);
  
  // Set up application menu
  setupAppMenu(mainWindow, isDevelopment);
  
  // Set up IPC handlers
  setupIpcHandlers(ipcMain, mainWindow);

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
