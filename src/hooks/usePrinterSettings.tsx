
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type PrinterSettingsState = {
  // Grundlegende Einstellungen
  enableAutomaticPrinting: boolean;
  printWithoutDialog: boolean;
  printDelay: number; // Verzögerung in Millisekunden
  selectedPrinterName: string | null; // Name des ausgewählten Druckers
  printCopies: number; // Anzahl der Kopien
  
  // Badge Position und Rotation (Oberer Ausweis)
  badgeRotation: 0 | 90 | 180 | 270; // Rotation in Grad (0, 90, 180, 270)
  badgeOffsetX: number; // Horizontale Verschiebung in mm
  badgeOffsetY: number; // Vertikale Verschiebung in mm

  // Badge Position und Rotation (Unterer Ausweis)
  secondBadgeRotation: 0 | 90 | 180 | 270; // Rotation in Grad (0, 90, 180, 270)
  secondBadgeOffsetX: number; // Horizontale Verschiebung in mm
  secondBadgeOffsetY: number; // Vertikale Verschiebung in mm

  // Aktionen
  setEnableAutomaticPrinting: (value: boolean) => void;
  setPrintWithoutDialog: (value: boolean) => void;
  setPrintDelay: (value: number) => void;
  setSelectedPrinterName: (value: string | null) => void;
  setPrintCopies: (value: number) => void;
  setBadgeRotation: (value: 0 | 90 | 180 | 270) => void;
  setBadgeOffsetX: (value: number) => void;
  setBadgeOffsetY: (value: number) => void;
  setSecondBadgeRotation: (value: 0 | 90 | 180 | 270) => void;
  setSecondBadgeOffsetX: (value: number) => void;
  setSecondBadgeOffsetY: (value: number) => void;
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
      
      // Standard Positionierung - Erster Ausweis
      badgeRotation: 0,
      badgeOffsetX: 0,
      badgeOffsetY: 0,

      // Standard Positionierung - Zweiter Ausweis
      secondBadgeRotation: 0,
      secondBadgeOffsetX: 0,
      secondBadgeOffsetY: 0,

      // Setter-Funktionen
      setEnableAutomaticPrinting: (value) => set({ enableAutomaticPrinting: value }),
      setPrintWithoutDialog: (value) => set({ printWithoutDialog: value }),
      setPrintDelay: (value) => set({ printDelay: value }),
      setSelectedPrinterName: (value) => set({ selectedPrinterName: value }),
      setPrintCopies: (value) => set({ printCopies: value }),
      setBadgeRotation: (value) => set({ badgeRotation: value }),
      setBadgeOffsetX: (value) => set({ badgeOffsetX: value }),
      setBadgeOffsetY: (value) => set({ badgeOffsetY: value }),
      setSecondBadgeRotation: (value) => set({ secondBadgeRotation: value }),
      setSecondBadgeOffsetX: (value) => set({ secondBadgeOffsetX: value }),
      setSecondBadgeOffsetY: (value) => set({ secondBadgeOffsetY: value }),
    }),
    {
      name: 'printer-settings', // localStorage key
      storage: createJSONStorage(() => electronStorage),
    }
  )
);
