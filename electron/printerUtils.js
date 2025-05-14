
/**
 * Print a route to PDF
 * @param {BrowserWindow} window - The main application window
 * @param {string} route - The route to print
 * @param {object} settings - Printer settings
 * @returns {Promise} A promise that resolves when printing is done
 */
export async function printToPDF(window, route, settings) {
  return new Promise((resolve, reject) => {
    try {
      // Navigate to the badge print route
      const currentURL = window.webContents.getURL();
      const baseUrl = currentURL.split('#')[0];
      
      // Apply custom positioning parameters for both badges
      const printOptions = settings.printOptions || {};
      
      // Position and rotation parameters
      const positionParams = `&offsetX=${printOptions.offsetX || 0}&offsetY=${printOptions.offsetY || 0}&rotation=${printOptions.rotation || 0}` +
                            `&secondOffsetX=${printOptions.secondOffsetX || 0}&secondOffsetY=${printOptions.secondOffsetY || 0}&secondRotation=${printOptions.secondRotation || 0}`;
      
      // Add layout parameters if available
      const layoutParams = settings.layoutOptions ? 
        `&layoutOptions=${encodeURIComponent(JSON.stringify(settings.layoutOptions))}` : '';
      
      const printURL = `${baseUrl}#${route}${positionParams}${layoutParams}`;
      
      // Create a new window for printing
      const printWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
      });
      
      printWindow.loadURL(printURL);
      
      printWindow.webContents.on('did-finish-load', async () => {
        try {
          // Allow time for rendering
          await new Promise(res => setTimeout(res, 1000));
          
          // Set A6 paper size settings with exact dimensions
          const printSettings = {
            ...settings,
            pageSize: { width: 105000, height: 148000 }, // A6 dimensions in microns (105mm x 148mm)
            printBackground: true,
            margins: {
              marginType: 'none' // No margins for exact sizing
            },
            landscape: false, // Always portrait for A6
            copies: settings.printCopies || 1,
            silent: settings.silent !== false, // Silent printing by default
            printSelectionOnly: false,
            scaleFactor: 100, // 100% scale for exact sizing
          };
          
          // Print the badge
          const result = await printWindow.webContents.print(printSettings);
          
          // Close the print window
          printWindow.close();
          
          resolve(result);
        } catch (err) {
          printWindow.close();
          reject(err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
