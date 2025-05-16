
/**
 * Utility functions for debugging
 */

/**
 * Enhanced console logging with timestamp and category
 * @param category Log category (e.g., 'PDF', 'Print')
 * @param message Main log message
 * @param data Additional data to log
 */
export const logDebug = (category: string, message: string, data?: any) => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
  const prefix = `[${timestamp}][${category}]`;
  
  if (data !== undefined) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

/**
 * Checks if a browser/environment feature is available
 * @param featureName Name of the feature to check
 * @param feature Feature to check
 */
export const checkFeature = (featureName: string, feature: any) => {
  logDebug('Environment', `Checking feature: ${featureName}`, !!feature ? 'Available' : 'Not available');
  return !!feature;
};

/**
 * Checks if pdfMake is properly initialized in the window object
 * @returns True if pdfMake is available and properly initialized
 */
export const isPdfMakeInitialized = () => {
  try {
    const hasPdfMake = typeof window.pdfMake !== 'undefined';
    const hasVfs = hasPdfMake && typeof window.pdfMake.vfs !== 'undefined';
    
    logDebug('PDF', `pdfMake availability check: ${hasPdfMake ? 'Available' : 'Not available'}`);
    logDebug('PDF', `pdfMake fonts (VFS) check: ${hasVfs ? 'Available' : 'Not available'}`);
    
    return hasPdfMake && hasVfs;
  } catch (error) {
    logDebug('PDF', 'Error checking pdfMake initialization', error);
    return false;
  }
};

/**
 * Checks the Blob functionality of the browser
 * @returns True if Blob functionality works correctly
 */
export const testBlobFunctionality = async (): Promise<boolean> => {
  try {
    logDebug('Blob', 'Testing Blob functionality');
    
    // Create a simple blob
    const testBlob = new Blob(['test content'], { type: 'text/plain' });
    logDebug('Blob', 'Created test blob', { size: testBlob.size, type: testBlob.type });
    
    // Create object URL
    const testUrl = URL.createObjectURL(testBlob);
    logDebug('Blob', 'Created object URL', testUrl);
    
    // Attempt to read the blob
    const text = await testBlob.text();
    logDebug('Blob', 'Successfully read blob content', text);
    
    // Clean up
    URL.revokeObjectURL(testUrl);
    
    return true;
  } catch (error) {
    logDebug('Blob', 'Blob functionality test failed', error);
    return false;
  }
};
