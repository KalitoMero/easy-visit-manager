
import { Visitor } from '@/hooks/useVisitorStore';
import { logDebug } from './debugUtils';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';

/**
 * Prints the current page containing the visitor badge(s)
 * @returns Promise that resolves when print dialog is opened
 */
export const printVisitorBadge = async (): Promise<void> => {
  try {
    logDebug('Print', 'Starting print process');
    
    // Add a small delay to ensure UI is fully rendered
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Call the browser's print function
    window.print();
    
    logDebug('Print', 'Print dialog opened');
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
    (printerSettings?.state?.skipPrintPreview);
  
  logDebug('Print', `Print settings - Skip preview: ${useSkipPreview}`);
  
  if (useSkipPreview) {
    // If skip preview is enabled, print directly
    logDebug('Print', `Skipping preview and printing badge directly for visitor ${visitor.visitorNumber}`);
    
    // Open the print page in a new window for direct printing
     const printWindow = window.open(`/print-badge/${visitor.id}?direct=true`, '_blank');
    
    
    // After a short delay, focus and print the new window
    if (printWindow) {
      setTimeout(() => {
        printWindow.focus();
         printWindow.print();
        // Print is handled in the BadgePrintPreview component when direct=true
      }, 1000);
    }
  } else {
    // Navigate to print preview as usual
    logDebug('Print', `Navigating to print badge preview for visitor ${visitor.visitorNumber}`);
    navigate(`/print-badge/${visitor.id}`);
  }
};

/**
 * Helper function to check if we're running in Electron
 */
export const isElectron = (): boolean => {
  return window && window.electronAPI && window.electronAPI.isElectron === true;
};
