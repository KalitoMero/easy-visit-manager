
import { Menu } from 'electron';

/**
 * Create and set application menu
 * @param {BrowserWindow} mainWindow - The main application window
 * @param {boolean} isDevelopment - Whether the app is in development mode
 */
export function setupAppMenu(mainWindow, isDevelopment) {
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
}
