
import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Printer functionality
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printBadge: (visitorData) => ipcRenderer.invoke('print-badge', visitorData),
  
  // Data storage
  getStoreData: (storeName) => ipcRenderer.invoke('get-store-data', storeName),
  setStoreData: (storeName, key, data) => ipcRenderer.invoke('set-store-data', storeName, key, data),
  
  // Import/Export
  exportVisitors: () => ipcRenderer.invoke('export-visitors'),
  importVisitors: () => ipcRenderer.invoke('import-visitors'),
  
  // App info
  isElectron: true,
  getVersion: () => process.env.npm_package_version || '1.0.0'
});
