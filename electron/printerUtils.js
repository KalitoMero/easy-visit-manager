
const { BrowserWindow, PrinterInfo } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Print a specific route to PDF and then send it to the printer
 * 
 * @param {BrowserWindow} parentWindow - The parent window
 * @param {string} route - The route to print
 * @param {Object} options - Print options
 * @returns {Promise<boolean>} - Success status
 */
exports.printToPDF = async (parentWindow, route, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a hidden window for printing
      const printWindow = new BrowserWindow({
        parent: parentWindow,
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });

      // Get the base URL from the parent window
      const currentURL = parentWindow.webContents.getURL();
      let baseURL;
      
      if (currentURL.startsWith('file:')) {
        // In production, we're loading from a file URL
        baseURL = 'file://' + path.join(__dirname, '../dist');
      } else {
        // In development, we're using a dev server
        const url = new URL(currentURL);
        baseURL = `${url.protocol}//${url.host}`;
      }
      
      // Load the specific route
      await printWindow.loadURL(`${baseURL}${route}`);
      
      // Wait for the page to fully render
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate PDF
      const pdfData = await printWindow.webContents.printToPDF({
        printBackground: options.printBackground || true,
        pageSize: 'A6', // Badge size, adjust as needed
        landscape: true,
        margins: {
          marginType: 'custom',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }
      });
      
      // Create a temp file for the PDF
      const tempFilePath = path.join(os.tmpdir(), `badge-${Date.now()}.pdf`);
      fs.writeFileSync(tempFilePath, pdfData);
      
      // Print the PDF
      const printerName = options.printerName || '';
      const success = await printWindow.webContents.print({
        silent: options.silent || false,
        printBackground: options.printBackground || true,
        deviceName: printerName,
        copies: options.copies || 1,
        margins: {
          marginType: 'none'
        }
      }, (success, reason) => {
        // Cleanup
        printWindow.close();
        try { fs.unlinkSync(tempFilePath); } catch (e) { /* ignore */ }
        
        if (success) {
          resolve(true);
        } else {
          reject(new Error(`Printing failed: ${reason}`));
        }
      });
      
      // If we're here, print() didn't provide a callback result
      if (typeof success === 'boolean') {
        // Cleanup
        printWindow.close();
        try { fs.unlinkSync(tempFilePath); } catch (e) { /* ignore */ }
        
        if (success) {
          resolve(true);
        } else {
          reject(new Error('Printing failed'));
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get all available printers
 * 
 * @param {BrowserWindow} window - Electron BrowserWindow
 * @returns {PrinterInfo[]} List of available printers
 */
exports.getAvailablePrinters = (window) => {
  return window.webContents.getPrinters();
};
