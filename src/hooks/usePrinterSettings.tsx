
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type PrinterSettingsState = {
  // Grundlegende Einstellungen
  enableAutomaticPrinting: boolean;
  printWithoutDialog: boolean;
  printDelay: number; // Verzögerung in Millisekunden
  selectedPrinterName: string | null; // Name des ausgewählten Druckers
  printCopies: number; // Anzahl der Kopien

  // Aktionen
  setEnableAutomaticPrinting: (value: boolean) => void;
  setPrintWithoutDialog: (value: boolean) => void;
  setPrintDelay: (value: number) => void;
  setSelectedPrinterName: (value: string | null) => void;
  setPrintCopies: (value: number) => void;
};

// Helper function to check if we're running in Electron
const isElectron = () => {
  return window && window.electronAPI && window.electronAPI.isElectron === true;
};

// Custom storage for Electron
const electronStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (isElectron()) {
      const data = await window.electronAPI.getStoreData('printer-settings');
      return data ? JSON.stringify(data) : null;
    } 
    const str = localStorage.getItem(name);
    return str ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (isElectron()) {
      const parsed = JSON.parse(value);
      await window.electronAPI.setStoreData('printer-settings', 'printerSettings', parsed);
    } else {
      localStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (isElectron()) {
      await window.electronAPI.setStoreData('printer-settings', 'printerSettings', null);
    } else {
      localStorage.removeItem(name);
    }
  },
};

export const usePrinterSettings = create<PrinterSettingsState>()(
  persist(
    (set) => ({
      // Standardwerte
      enableAutomaticPrinting: true,
      printWithoutDialog: false,
      printDelay: 500,
      selectedPrinterName: null,
      printCopies: 1,

      // Setter-Funktionen
      setEnableAutomaticPrinting: (value) => set({ enableAutomaticPrinting: value }),
      setPrintWithoutDialog: (value) => set({ printWithoutDialog: value }),
      setPrintDelay: (value) => set({ printDelay: value }),
      setSelectedPrinterName: (value) => set({ selectedPrinterName: value }),
      setPrintCopies: (value) => set({ printCopies: value }), // Fixed: Was incorrectly setting 'setPrintCopies' instead of 'printCopies'
    }),
    {
      name: 'printer-settings', // localStorage key
      storage: createJSONStorage(() => electronStorage),
    }
  )
);
