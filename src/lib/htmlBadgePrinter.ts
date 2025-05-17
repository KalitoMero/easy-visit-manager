
import { Visitor } from '@/hooks/useVisitorStore';
import { logDebug } from './debugUtils';

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
 * Navigates to the badge print preview page
 * @param visitor The visitor to print a badge for
 * @param navigate The navigation function from react-router
 */
export const navigateToPrintPreview = (
  visitor: Visitor, 
  navigate: (path: string) => void
): void => {
  if (!visitor || !visitor.id) {
    logDebug('Print', 'Cannot navigate to print preview: invalid visitor data');
    return;
  }
  
  logDebug('Print', `Navigating to badge print preview for visitor ${visitor.visitorNumber}`);
  navigate(`/badge-print-preview/${visitor.id}`);
};

/**
 * Helper function to check if we're running in Electron
 */
export const isElectron = (): boolean => {
  return window && window.electronAPI && window.electronAPI.isElectron === true;
};
