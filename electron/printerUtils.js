
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
      const printURL = `${baseUrl}#${route}`;
      
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
          
          // Print the badge
          const result = await printWindow.webContents.print(settings);
          
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
