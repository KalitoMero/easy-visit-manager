
import { Visitor } from '@/hooks/useVisitorStore';
import { logDebug } from './debugUtils';

/**
 * Global variable to prevent multiple print requests
 */
let isPrintingInProgress = false;
let lastPrintTimestamp = 0;
const PRINT_COOLDOWN = 1000; // 1 second cooldown between prints (reduced from 2s)

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
    
    // Return a promise that resolves immediately
    return new Promise((resolve) => {
      // Very short delay to process the print dialog
      if (printCycleTimeout) {
        clearTimeout(printCycleTimeout);
      }
      
      // Immediately resolve to allow faster navigation
      resolve();
      
      // Still reset the print flags after a shorter delay
      printCycleTimeout = setTimeout(() => {
        isPrintingInProgress = false;
        printCycleActive = false;
        logDebug('Print', 'Print cycle fully completed and reset');
      }, 500); // 500ms for full cycle completion (reduced from 1000ms)
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
  
  // Reset prior to navigation to ensure clean state
  resetPrintStatus();
  
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
    
    // Open print page in new window with direct=true parameter to trigger immediate printing
    const printWindow = window.open(`/print-badge/${visitor.id}?direct=true&flow=checkin&t=${timestamp}`, '_blank');
    
    // Focus new window if opened
    if (printWindow) {
      printWindow.focus();
    }
    
    // Navigate to success page immediately after opening print window
    // Use a shorter timeout for faster navigation
    setTimeout(() => {
      navigate(`/checkin/step3/${visitor.id}`);
    }, 100);
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
  const MAX_PRINT_ATTEMPTS = 2; // Allow 2 print attempts (increased from 1)
  const PRINT_RESET_TIMEOUT = 800; // Reset print controller after 800ms (reduced from 1000ms)
  let resetTimer: number | null = null;
  
  return {
    // Try to start printing if not already in progress
    print: (): boolean => {
      if (isPrinting) {
        logDebug('Print', `Print blocked - already running`);
        return false;
      }
      
      if (printAttempts >= MAX_PRINT_ATTEMPTS) {
        logDebug('Print', `Print blocked - max attempts reached (${printAttempts})`);
        printAttempts = 0; // Reset attempts to allow navigation
        return false;
      }
      
      if (printCycleActive) {
        logDebug('Print', `Print blocked - global print cycle active`);
        // Force reset global state if it's stuck
        resetPrintStatus();
        return true;
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
