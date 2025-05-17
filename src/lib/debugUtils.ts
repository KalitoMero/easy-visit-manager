
/**
 * Utility functions for debugging
 */

/**
 * Enhanced console logging with timestamp and category
 * @param category Log category (e.g., 'Print', 'Badge')
 * @param message Main log message
 * @param data Additional data to log
 */
export const logDebug = (category: string, message: string, data?: any) => {
  try {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
    const prefix = `[${timestamp}][${category}]`;
    
    if (data !== undefined) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  } catch (e) {
    // Fail silently - logging should never break the app
    console.log('Error in logging utility:', e);
  }
};

/**
 * Checks if a browser/environment feature is available
 * @param featureName Name of the feature to check
 * @param feature Feature to check
 */
export const checkFeature = (featureName: string, feature: any) => {
  try {
    logDebug('Environment', `Checking feature: ${featureName}`, !!feature ? 'Available' : 'Not available');
    return !!feature;
  } catch (e) {
    logDebug('Environment', `Error checking feature: ${featureName}`, e);
    return false;
  }
};

/**
 * Tests basic print functionality of the browser
 */
export const testPrintFunctionality = (): boolean => {
  try {
    logDebug('Print', 'Testing print functionality');
    return typeof window !== 'undefined' && typeof window.print === 'function';
  } catch (error) {
    logDebug('Print', 'Print functionality test failed', error);
    return false;
  }
};
