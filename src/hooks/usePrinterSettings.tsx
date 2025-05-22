
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface BadgeLayoutOptions {
  showContact: boolean;
  showDateTime: boolean;
  fontSizeTitle: 'small' | 'medium' | 'large';
  fontSizeName: 'small' | 'medium' | 'large';
  fontSizeCompany: 'small' | 'medium' | 'large';
  qrCodeSize: number;
  footerSpacing: number;
  qrCodePosition: 'right' | 'center';
}

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
  policyImageUrl?: string | null; // Added missing property
  
  // New properties for badge positioning and layout
  badgeOffsetX: number;
  badgeOffsetY: number;
  secondBadgeRotation: number;
  secondBadgeOffsetX: number;
  secondBadgeOffsetY: number;
  skipPrintPreview: boolean;
  badgeLayout: BadgeLayoutOptions;
  bottomMargin: number;
  
  // Original setter methods
  setEnableAutomaticPrinting: (enabled: boolean) => void;
  setPrintWithoutDialog: (withoutDialog: boolean) => void;
  setPrintDelay: (delay: number) => void;
  setShowBrandingOnPrint: (show: boolean) => void;
  setBadgePositionX: (position: number) => void;
  setBadgePositionY: (position: number) => void;
  setBadgeRotation: (rotation: number) => void;
  setCompanyLogo: (logo: string | null) => void;
  setShowBuiltByText: (show: boolean) => void;
  setPolicyImageUrl?: (url: string | null) => void; // Added setter method
  
  // New setter methods
  setBadgeOffsetX: (offset: number) => void;
  setBadgeOffsetY: (offset: number) => void;
  setSecondBadgeRotation: (rotation: number) => void;
  setSecondBadgeOffsetX: (offset: number) => void;
  setSecondBadgeOffsetY: (offset: number) => void;
  setSkipPrintPreview: (skip: boolean) => void;
  setBadgeLayout: (layout: Partial<BadgeLayoutOptions>) => void;
  setBottomMargin: (margin: number) => void;
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
      policyImageUrl: null, // Initialize the property
      
      // Initialize new properties
      badgeOffsetX: 0,
      badgeOffsetY: 0,
      secondBadgeRotation: 0,
      secondBadgeOffsetX: 0,
      secondBadgeOffsetY: 0,
      skipPrintPreview: false,
      bottomMargin: 0,
      badgeLayout: {
        showContact: true,
        showDateTime: true,
        fontSizeTitle: 'medium',
        fontSizeName: 'medium',
        fontSizeCompany: 'medium',
        qrCodeSize: 120,
        footerSpacing: 8,
        qrCodePosition: 'right'
      },
      
      // Original setter methods
      setEnableAutomaticPrinting: (enabled: boolean) => set({ enableAutomaticPrinting: enabled }),
      setPrintWithoutDialog: (withoutDialog: boolean) => set({ printWithoutDialog: withoutDialog }),
      setPrintDelay: (delay: number) => set({ printDelay: delay }),
      setShowBrandingOnPrint: (show: boolean) => set({ showBrandingOnPrint: show }),
      setBadgePositionX: (position: number) => set({ badgePositionX: position }),
      setBadgePositionY: (position: number) => set({ badgePositionY: position }),
      setBadgeRotation: (rotation: number) => set({ badgeRotation: rotation }),
      setCompanyLogo: (logo: string | null) => set({ companyLogo: logo }),
      setShowBuiltByText: (show: boolean) => set({ showBuiltByText: show }),
      setPolicyImageUrl: (url: string | null) => set({ policyImageUrl: url }),
      
      // New setter methods
      setBadgeOffsetX: (offset: number) => set({ badgeOffsetX: offset }),
      setBadgeOffsetY: (offset: number) => set({ badgeOffsetY: offset }),
      setSecondBadgeRotation: (rotation: number) => set({ secondBadgeRotation: rotation }),
      setSecondBadgeOffsetX: (offset: number) => set({ secondBadgeOffsetX: offset }),
      setSecondBadgeOffsetY: (offset: number) => set({ secondBadgeOffsetY: offset }),
      setSkipPrintPreview: (skip: boolean) => set({ skipPrintPreview: skip }),
      setBadgeLayout: (layout: Partial<BadgeLayoutOptions>) => 
        set((state) => ({ 
          badgeLayout: { ...state.badgeLayout, ...layout } 
        })),
      setBottomMargin: (margin: number) => set({ bottomMargin: margin }),
    }),
    {
      name: "printer-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
