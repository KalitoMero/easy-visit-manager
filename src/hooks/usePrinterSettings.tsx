
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type PrinterSettingsState = {
  // Grundlegende Einstellungen
  enableAutomaticPrinting: boolean;
  printWithoutDialog: boolean;
  printDelay: number; // Verzögerung in Millisekunden

  // Aktionen
  setEnableAutomaticPrinting: (value: boolean) => void;
  setPrintWithoutDialog: (value: boolean) => void;
  setPrintDelay: (value: number) => void;
};

export const usePrinterSettings = create<PrinterSettingsState>()(
  persist(
    (set) => ({
      // Standardwerte
      enableAutomaticPrinting: true,
      printWithoutDialog: false,
      printDelay: 500,

      // Setter-Funktionen
      setEnableAutomaticPrinting: (value) => set({ enableAutomaticPrinting: value }),
      setPrintWithoutDialog: (value) => set({ printWithoutDialog: value }),
      setPrintDelay: (value) => set({ printDelay: value }),
    }),
    {
      name: 'printer-settings', // localStorage key
    }
  )
);
