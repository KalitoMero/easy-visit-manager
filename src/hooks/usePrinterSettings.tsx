import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PrinterSettingsStore {
  enableAutomaticPrinting: boolean;
  printWithoutDialog: boolean;
  printDelay: number;
  showBrandingOnPrint: boolean;
  badgePositionX: number;
  badgePositionY: number;
  badgeRotation: number;
  companyLogo: string | null;
  showBuiltByText: boolean;
  setEnableAutomaticPrinting: (enabled: boolean) => void;
  setPrintWithoutDialog: (withoutDialog: boolean) => void;
  setPrintDelay: (delay: number) => void;
  setShowBrandingOnPrint: (show: boolean) => void;
  setBadgePositionX: (position: number) => void;
  setBadgePositionY: (position: number) => void;
  setBadgeRotation: (rotation: number) => void;
  setCompanyLogo: (logo: string | null) => void;
  setShowBuiltByText: (show: boolean) => void;
}

interface PrinterSettings {
  enableAutomaticPrinting: boolean;
  printWithoutDialog: boolean;
  printDelay: number;
  showBrandingOnPrint: boolean;
  badgePositionX: number;
  badgePositionY: number;
  badgeRotation: number;
  companyLogo: string | null;
  showBuiltByText: boolean;
}

export const usePrinterSettings = create<PrinterSettingsStore>()(
  persist(
    (set) => ({
      enableAutomaticPrinting: false,
      printWithoutDialog: false,
      printDelay: 0,
      showBrandingOnPrint: true,
      badgePositionX: 0,
      badgePositionY: 0,
      badgeRotation: 0,
      companyLogo: null,
      showBuiltByText: true,
      setEnableAutomaticPrinting: (enabled: boolean) => set({ enableAutomaticPrinting: enabled }),
      setPrintWithoutDialog: (withoutDialog: boolean) => set({ printWithoutDialog: withoutDialog }),
      setPrintDelay: (delay: number) => set({ printDelay: delay }),
      setShowBrandingOnPrint: (show: boolean) => set({ showBrandingOnPrint: show }),
      setBadgePositionX: (position: number) => set({ badgePositionX: position }),
      setBadgePositionY: (position: number) => set({ badgePositionY: position }),
      setBadgeRotation: (rotation: number) => set({ badgeRotation: rotation }),
      setCompanyLogo: (logo: string | null) => set({ companyLogo: logo }),
      setShowBuiltByText: (show: boolean) => set({ showBuiltByText: show }),
    }),
    {
      name: "printer-settings",
      getStorage: () => localStorage,
    }
  )
);
