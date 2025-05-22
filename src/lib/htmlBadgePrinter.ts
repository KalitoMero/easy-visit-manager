
import { Visitor } from '@/hooks/useVisitorStore';
import { logDebug } from './debugUtils';

/**
 * Prints the current page containing the visitor badge(s)
 * @returns Promise that resolves when print dialog is opened
 */
export const printVisitorBadge = async (): Promise<void> => {
  try {
    logDebug('Print', 'Starting print process');
    
    // Call the browser's print function directly
    window.print();
    
    logDebug('Print', 'Print dialog opened');
    return Promise.resolve();
  } catch (error) {
    logDebug('Print', 'Error during print process', error);
    throw error;
  }
};

/**
 * Navigates to the badge print preview page or directly prints without preview
 * @param visitor The visitor to print a badge for
 * @param navigate The navigation function from react-router
 * @param skipPreview Whether to skip preview and print directly
 */
export const navigateToPrintPreview = (
  visitor: Visitor, 
  navigate: (path: string) => void,
  skipPreview?: boolean
): void => {
  if (!visitor || !visitor.id) {
    logDebug('Print', 'Cannot navigate to print preview: invalid visitor data');
    return;
  }
  
  // Get printer settings from localStorage
  const printerSettings = typeof window !== 'undefined' && 
     window.localStorage && 
     JSON.parse(window.localStorage.getItem('printer-settings') || '{}');
  
  // Use provided skipPreview or get it from settings  
  const useSkipPreview = skipPreview ?? 
    (printerSettings?.skipPrintPreview);
  
  // Add timestamp to prevent caching issues
  const timestamp = new Date().getTime();
  
  logDebug('Print', `Print settings - Skip preview: ${useSkipPreview}`);
  
  if (useSkipPreview) {
    // If skip preview is enabled, print directly
    logDebug('Print', `Skipping preview and printing badge directly for visitor ${visitor.visitorNumber}`);
    
    // Open the print page in a new window for direct printing
    const printWindow = window.open(`/print-badge/${visitor.id}?direct=true&t=${timestamp}`, '_blank');
    
    // Print the new window immediately if it was opened
    if (printWindow) {
      printWindow.focus();
    }
  } else {
    // Navigate to print preview as usual, but add a parameter to indicate
    // that we're coming from the check-in flow
    logDebug('Print', `Navigating to print badge preview for visitor ${visitor.visitorNumber}`);
    navigate(`/print-badge/${visitor.id}?flow=checkin&t=${timestamp}`);
  }
};

/**
 * Helper function to check if we're running in Electron
 */
export const isElectron = (): boolean => {
  return window && window.electronAPI && window.electronAPI.isElectron === true;
};

/**
 * Helper function to prevent print loops by tracking print state
 */
export const createPrintController = () => {
  // Create a closure to track print state
  let isPrinting = false;
  let printAttempts = 0;
  const MAX_PRINT_ATTEMPTS = 2; // Prevent more than 2 print attempts
  
  return {
    // Try to start printing if not already in progress
    print: (): boolean => {
      if (isPrinting || printAttempts >= MAX_PRINT_ATTEMPTS) {
        logDebug('Print', `Print blocked - already printing or max attempts reached (${printAttempts})`);
        return false;
      }
      
      isPrinting = true;
      printAttempts++;
      logDebug('Print', `Print started - attempt ${printAttempts}`);
      return true;
    },
    
    // Reset print state
    reset: (): void => {
      isPrinting = false;
      printAttempts = 0;
      logDebug('Print', 'Print controller reset');
    },
    
    // Get current state
    getState: () => ({ isPrinting, printAttempts })
  };
};
