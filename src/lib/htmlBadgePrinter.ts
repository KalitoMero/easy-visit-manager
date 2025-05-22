import { Visitor } from '@/hooks/useVisitorStore';
import { logDebug } from './debugUtils';

/**
 * Global variable to prevent multiple print requests
 */
let isPrintingInProgress = false;
let lastPrintTimestamp = 0;
const PRINT_COOLDOWN = 2000; // 2 seconds cooldown between prints

// Add global flag to track if we're currently in a print cycle
let printCycleActive = false;
let printCycleTimeout = null;

/**
 * Prints the current page containing the visitor badge(s)
 * @returns Promise that resolves when print dialog is opened
 */
export const printVisitorBadge = async (): Promise<void> => {
  try {
    const now = Date.now();
    
    // Check for an active print cycle - prevents loops
    if (printCycleActive) {
      logDebug('Print', 'Print cycle already active, preventing additional print calls');
      return Promise.resolve();
    }

    // Check for cooldown period to prevent multiple rapid prints
    if (now - lastPrintTimestamp < PRINT_COOLDOWN) {
      logDebug('Print', `Print request too soon after last print (${now - lastPrintTimestamp}ms), ignoring`);
      return Promise.resolve();
    }
    
    // If printing is already in progress, do nothing
    if (isPrintingInProgress) {
      logDebug('Print', 'Print process already running, preventing duplicate call');
      return Promise.resolve();
    }
    
    // Set print status
    isPrintingInProgress = true;
    printCycleActive = true;
    lastPrintTimestamp = now;
    logDebug('Print', 'Print process started');
    
    // Call browser print function
    window.print();
    
    logDebug('Print', 'Print dialog opened');
    
    // Return a promise that resolves after a short delay
    return new Promise((resolve) => {
      // Short delay to process the print dialog
      if (printCycleTimeout) {
        clearTimeout(printCycleTimeout);
      }
      
      // Reduce timeout duration for faster navigation
      printCycleTimeout = setTimeout(() => {
        isPrintingInProgress = false;
        // Keep print cycle active for a longer period to ensure no repeat prints
        setTimeout(() => {
          printCycleActive = false;
          logDebug('Print', 'Print cycle fully completed');
        }, 3000); // 3 seconds for full cycle completion
        
        logDebug('Print', 'Print status reset');
        resolve();
      }, 500); // Reduced from 1500ms for faster navigation
    });
  } catch (error) {
    // Reset print status on error
    isPrintingInProgress = false;
    printCycleActive = false;
    logDebug('Print', 'Error during print process', error);
    throw error;
  }
};

/**
 * Function to reset print status
 */
export const resetPrintStatus = (): void => {
  isPrintingInProgress = false;
  printCycleActive = false;
  
  if (printCycleTimeout) {
    clearTimeout(printCycleTimeout);
    printCycleTimeout = null;
  }
  
  logDebug('Print', 'Print status manually reset');
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
    logDebug('Print', 'Navigation to print preview not possible: Invalid visitor data');
    return;
  }
  
  // Get printer settings from localStorage
  const printerSettings = typeof window !== 'undefined' && 
     window.localStorage && 
     JSON.parse(window.localStorage.getItem('printer-settings') || '{}');
  
  // Use skipPreview from settings or parameter
  const useSkipPreview = skipPreview ?? 
    (printerSettings?.skipPrintPreview);
  
  // Add timestamp to avoid cache issues
  const timestamp = new Date().getTime();
  
  logDebug('Print', `Print settings - Skip preview: ${useSkipPreview}`);
  
  if (useSkipPreview) {
    // If preview should be skipped, print directly
    logDebug('Print', `Skipping preview and printing badge directly for visitor ${visitor.visitorNumber}`);
    
    // Prevent print cycles
    if (printCycleActive) {
      logDebug('Print', 'Print cycle already active, preventing opening print window');
      return;
    }
    
    // Open print page in new window with direct=true parameter to trigger immediate printing
    const printWindow = window.open(`/print-badge/${visitor.id}?direct=true&flow=checkin&t=${timestamp}`, '_blank');
    
    // Focus new window if opened
    if (printWindow) {
      printWindow.focus();
    }
  } else {
    // Navigate to print preview with parameter indicating we're coming from check-in flow
    logDebug('Print', `Navigating to print preview for visitor ${visitor.visitorNumber}`);
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
  // Create closure to track print status
  let isPrinting = false;
  let printAttempts = 0;
  const MAX_PRINT_ATTEMPTS = 1; // Only allow 1 print attempt
  const PRINT_RESET_TIMEOUT = 5000; // Reset print controller after 5 seconds
  let resetTimer: number | null = null;
  
  return {
    // Try to start printing if not already in progress
    print: (): boolean => {
      if (isPrinting || printAttempts >= MAX_PRINT_ATTEMPTS || printCycleActive) {
        logDebug('Print', `Print blocked - already running or max attempts reached (${printAttempts}) or print cycle active`);
        return false;
      }
      
      isPrinting = true;
      printAttempts++;
      logDebug('Print', `Print started - Attempt ${printAttempts}`);
      
      // Auto-reset after timeout to prevent stuck state
      if (resetTimer) {
        window.clearTimeout(resetTimer);
      }
      
      resetTimer = window.setTimeout(() => {
        isPrinting = false;
        printAttempts = 0;
        logDebug('Print', 'Print controller auto-reset after timeout');
        resetTimer = null;
      }, PRINT_RESET_TIMEOUT);
      
      return true;
    },
    
    // Reset print status
    reset: (): void => {
      isPrinting = false;
      printAttempts = 0;
      logDebug('Print', 'Print controller manually reset');
      
      if (resetTimer) {
        window.clearTimeout(resetTimer);
        resetTimer = null;
      }
    },
    
    // Get current status
    getState: () => ({ isPrinting, printAttempts })
  };
};
