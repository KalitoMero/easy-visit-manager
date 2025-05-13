
import { BrowserWindow, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import url from 'url';
import fs from 'fs';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create the main application window
 * @param {boolean} isDevelopment - Whether the app is in development mode
 * @returns {BrowserWindow} The created browser window
 */
export function createMainWindow(isDevelopment) {
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
    // In development, load from the dev server
    console.log('Loading app in development mode from dev server...');
    mainWindow.loadURL('http://localhost:8080').catch((err) => {
      console.error('Failed to load from dev server, is it running?', err);
      mainWindow.loadURL(
        url.format({
          pathname: path.join(__dirname, 'error.html'),
          protocol: 'file:',
          slashes: true,
        })
      ).catch(() => {
        mainWindow.loadURL('data:text/html,<html><body><h2>Error</h2><p>Development server not running. Please start the dev server with "npm run dev" first.</p></body></html>');
      });
    });
    mainWindow.webContents.openDevTools();
  } else {
    // In production, check if the dist directory exists
    const distPath = path.join(__dirname, '../dist');
    const indexPath = path.join(distPath, 'index.html');
    
    console.log('Running in production mode, looking for build at:', indexPath);
    
    if (fs.existsSync(indexPath)) {
      // If the index.html file exists, load it
      console.log('Found build files, loading application...');
      mainWindow.loadURL(
        url.format({
          pathname: indexPath,
          protocol: 'file:',
          slashes: true,
        })
      );
    } else {
      // If the index.html file doesn't exist, show error message
      console.error('Production build not found at:', distPath);
      console.warn('Please run "npm run build" first to create the production build.');
      
      mainWindow.loadURL(
        url.format({
          pathname: path.join(__dirname, 'error.html'),
          protocol: 'file:',
          slashes: true,
        })
      ).catch(() => {
        // If error.html doesn't exist, show a basic error in the window
        mainWindow.loadURL('data:text/html,<html><body><h2>Error</h2><p>Failed to load application. Please build the app with "npm run build" first or start the development server.</p></body></html>');
      });
    }
  }

  return mainWindow;
}
