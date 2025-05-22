
import { Visitor } from '@/hooks/useVisitorStore';
import { logDebug } from './debugUtils';

/**
 * Global variable to prevent multiple print requests
 */
let isPrintingInProgress = false;
let lastPrintTimestamp = 0;
const PRINT_COOLDOWN = 3000; // 3 seconds cooldown between prints

// Global flag to track if we're currently in a print cycle
let printCycleActive = false;
let printCycleTimeout = null;

// ANTI-LOOP protection - global tracker
let printInvocationsCount = 0;
const MAX_PRINT_INVOCATIONS = 2;
let lastResetTime = Date.now();
const RESET_COUNTER_INTERVAL = 10000; // Reset count after 10 seconds of inactivity

// New global storage key for cross-window communication
const PRINT_STATUS_STORAGE_KEY = 'visitor-badge-print-status';
// Storage key for tracking recent print operations
const PRINT_HISTORY_KEY = 'visitor-print-history';

/**
 * Check if print has been recently initiated based on localStorage
 */
const hasPrintBeenInitiatedRecently = (): boolean => {
  try {
    const storedStatus = localStorage.getItem(PRINT_STATUS_STORAGE_KEY);
    if (!storedStatus) return false;
    
    const status = JSON.parse(storedStatus);
    const now = Date.now();
    
    // If print was initiated in the last 5 seconds, consider it recent
    return (status.timestamp && now - status.timestamp < 5000);
  } catch (e) {
    return false;
  }
};

/**
 * Set global print status in localStorage for cross-window communication
 */
const setGlobalPrintStatus = (isPrinting: boolean): void => {
  try {
    localStorage.setItem(PRINT_STATUS_STORAGE_KEY, JSON.stringify({
      isPrinting,
      timestamp: Date.now()
    }));
  } catch (e) {
    // Ignore storage errors
  }
};

/**
 * Prints the current page containing the visitor badge(s)
 * @returns Promise that resolves when print dialog is opened
 */
export const printVisitorBadge = async (): Promise<void> => {
  try {
    const now = Date.now();
    
    // ANTI-LOOP: Reset counter if enough time has passed
    if (now - lastResetTime > RESET_COUNTER_INTERVAL) {
      printInvocationsCount = 0;
      lastResetTime = now;
      logDebug('Print', 'Print invocation counter reset due to timeout');
    }
    
    // ANTI-LOOP: Increment counter and check if we've hit the limit
    printInvocationsCount++;
    if (printInvocationsCount > MAX_PRINT_INVOCATIONS) {
      logDebug('Print', `🛑 EMERGENCY STOP: Print loop detected (${printInvocationsCount} invocations)`);
      resetPrintStatus(); // Force reset all print statuses
      return Promise.resolve(); // Exit immediately
    }
    
    // Cross-window check - has another window already initiated printing?
    if (hasPrintBeenInitiatedRecently()) {
      logDebug('Print', '🛑 Print already initiated in another window/tab, blocking');
      return Promise.resolve();
    }
    
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
    
    // Set print status both locally and globally (cross-window)
    isPrintingInProgress = true;
    printCycleActive = true;
    lastPrintTimestamp = now;
    setGlobalPrintStatus(true);
    logDebug('Print', 'Print process started');
    
    // Call browser print function
    window.print();
    
    logDebug('Print', 'Print dialog opened');
    
    // Return a promise that resolves immediately
    return new Promise((resolve) => {
      // Clear any existing timeout
      if (printCycleTimeout) {
        clearTimeout(printCycleTimeout);
      }
      
      // Immediately resolve to allow faster navigation
      resolve();
      
      // Still reset the print flags after a short delay
      printCycleTimeout = setTimeout(() => {
        resetPrintStatus();
        logDebug('Print', 'Print cycle fully completed and reset');
      }, 500); // 500ms for full cycle completion
    });
  } catch (error) {
    // Reset print status on error
    resetPrintStatus();
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
  setGlobalPrintStatus(false);
  
  if (printCycleTimeout) {
    clearTimeout(printCycleTimeout);
    printCycleTimeout = null;
  }
  
  logDebug('Print', 'Print status manually reset');
};

/**
 * Record that a visitor's badge was printed
 * @param visitorId The ID of the visitor that was printed
 */
export const recordPrintedVisitor = (visitorId: string): void => {
  if (!visitorId) return;
  
  try {
    const printHistory = JSON.parse(localStorage.getItem(PRINT_HISTORY_KEY) || '{}');
    printHistory[visitorId] = Date.now();
    localStorage.setItem(PRINT_HISTORY_KEY, JSON.stringify(printHistory));
    logDebug('Print', `Recorded print for visitor ${visitorId}`);
  } catch (e) {
    // Ignore storage errors
  }
};

/**
 * Check if a visitor was recently printed
 * @param visitorId The ID of the visitor to check
 * @returns boolean indicating whether visitor was recently printed
 */
export const wasVisitorRecentlyPrinted = (visitorId: string): boolean => {
  if (!visitorId) return false;
  
  try {
    const printHistory = JSON.parse(localStorage.getItem(PRINT_HISTORY_KEY) || '{}');
    if (!printHistory[visitorId]) return false;
    
    const elapsedTime = Date.now() - printHistory[visitorId];
    return elapsedTime < 10000; // 10 seconds
  } catch (e) {
    return false;
  }
};

/**
 * Navigates to the badge print preview page or directly opens print popup
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
    // Check if we should block this print (if recent print detected)
    if (hasPrintBeenInitiatedRecently()) {
      logDebug('Print', '🛑 Blocking new print window - recent print detected');
      
      // Skip opening print window, just navigate to success page
      navigate(`/checkin/step3/${visitor.id}?fromPrint=true`);
      return;
    }
    
    // Mark print as initiated in localStorage (for cross-window awareness)
    setGlobalPrintStatus(true);
    
    logDebug('Print', `Skipping preview and printing badge directly for visitor ${visitor.visitorNumber}`);
    
    // Open print page in new tab with direct=true parameter to trigger immediate printing
    const printUrl = `/print-badge/${visitor.id}?direct=true&flow=checkin&t=${timestamp}`;
    const printWindow = window.open(printUrl, '_blank');
    
    // Focus new window if opened
    if (printWindow) {
      printWindow.focus();
    }
    
    // Ensure we navigate to success page immediately after opening print window
    navigate(`/checkin/step3/${visitor.id}?fromPrint=true`);
  } else {
    // Navigate to regular print preview with parameter indicating we're coming from check-in flow
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
  const MAX_PRINT_ATTEMPTS = 1; // Reduced to 1 to prevent multiple attempts
  const PRINT_RESET_TIMEOUT = 2000; // 2 seconds safety timeout
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
