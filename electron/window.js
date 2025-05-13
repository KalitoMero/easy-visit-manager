
const { BrowserWindow, screen } = require('electron');
const path = require('path');
const url = require('url');

/**
 * Create the main application window
 * @param {boolean} isDevelopment - Whether the app is in development mode
 * @returns {BrowserWindow} The created browser window
 */
function createMainWindow(isDevelopment) {
  // Get screen dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create the browser window
  const mainWindow = new BrowserWindow({
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

  return mainWindow;
}

module.exports = {
  createMainWindow
};
