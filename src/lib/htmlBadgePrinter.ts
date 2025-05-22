
import { Visitor } from '@/hooks/useVisitorStore';
import { logDebug } from './debugUtils';

/**
 * Globale Variable, um mehrfache Druckaufträge zu verhindern
 */
let isPrintingInProgress = false;

/**
 * Prints the current page containing the visitor badge(s)
 * @returns Promise that resolves when print dialog is opened
 */
export const printVisitorBadge = async (): Promise<void> => {
  try {
    // Wenn bereits ein Druckprozess läuft, nichts tun
    if (isPrintingInProgress) {
      logDebug('Print', 'Druckprozess läuft bereits, doppelter Aufruf verhindert');
      return Promise.resolve();
    }
    
    // Druckstatus setzen
    isPrintingInProgress = true;
    logDebug('Print', 'Druckprozess gestartet');
    
    // Browser-Druckfunktion aufrufen
    window.print();
    
    logDebug('Print', 'Druckdialog geöffnet');
    
    // Promise zurückgeben, das nach kurzer Verzögerung auflöst
    return new Promise((resolve) => {
      // Kurze Verzögerung, um den Druckdialog zu verarbeiten
      setTimeout(() => {
        isPrintingInProgress = false;
        logDebug('Print', 'Druckstatus zurückgesetzt');
        resolve();
      }, 1000);
    });
  } catch (error) {
    // Bei Fehler den Druckstatus zurücksetzen
    isPrintingInProgress = false;
    logDebug('Print', 'Fehler während des Druckprozesses', error);
    throw error;
  }
};

/**
 * Funktion zum Zurücksetzen des Druckstatus
 */
export const resetPrintStatus = (): void => {
  isPrintingInProgress = false;
  logDebug('Print', 'Druckstatus manuell zurückgesetzt');
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
    logDebug('Print', 'Navigation zur Druckvorschau nicht möglich: Ungültige Besucherdaten');
    return;
  }
  
  // Druckereinstellungen aus dem localStorage holen
  const printerSettings = typeof window !== 'undefined' && 
     window.localStorage && 
     JSON.parse(window.localStorage.getItem('printer-settings') || '{}');
  
  // SkipPreview aus den Einstellungen oder dem Parameter verwenden
  const useSkipPreview = skipPreview ?? 
    (printerSettings?.skipPrintPreview);
  
  // Timestamp hinzufügen, um Cache-Probleme zu vermeiden
  const timestamp = new Date().getTime();
  
  logDebug('Print', `Druckeinstellungen - Vorschau überspringen: ${useSkipPreview}`);
  
  if (useSkipPreview) {
    // Wenn Vorschau übersprungen werden soll, direkt drucken
    logDebug('Print', `Vorschau wird übersprungen und Badge wird direkt für Besucher ${visitor.visitorNumber} gedruckt`);
    
    // Druckseite in neuem Fenster öffnen
    const printWindow = window.open(`/print-badge/${visitor.id}?direct=true&t=${timestamp}`, '_blank');
    
    // Neues Fenster sofort fokussieren, wenn es geöffnet wurde
    if (printWindow) {
      printWindow.focus();
    }
  } else {
    // Zur Druckvorschau navigieren, mit Parameter, dass wir vom Check-in-Flow kommen
    logDebug('Print', `Navigation zur Druckvorschau für Besucher ${visitor.visitorNumber}`);
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
  // Closure erstellen, um Druckstatus zu tracken
  let isPrinting = false;
  let printAttempts = 0;
  const MAX_PRINT_ATTEMPTS = 1; // Nur 1 Druckversuch zulassen (reduziert von 2)
  
  return {
    // Versuchen, den Druck zu starten, wenn nicht bereits im Gang
    print: (): boolean => {
      if (isPrinting || printAttempts >= MAX_PRINT_ATTEMPTS) {
        logDebug('Print', `Druck blockiert - läuft bereits oder maximale Versuche erreicht (${printAttempts})`);
        return false;
      }
      
      isPrinting = true;
      printAttempts++;
      logDebug('Print', `Druck gestartet - Versuch ${printAttempts}`);
      return true;
    },
    
    // Druckstatus zurücksetzen
    reset: (): void => {
      isPrinting = false;
      printAttempts = 0;
      logDebug('Print', 'Druck-Controller zurückgesetzt');
    },
    
    // Aktuellen Status abrufen
    getState: () => ({ isPrinting, printAttempts })
  };
};
