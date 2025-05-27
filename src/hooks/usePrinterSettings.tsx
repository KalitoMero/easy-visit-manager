import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '@/lib/apiClient';

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
  policyImageUrl?: string | null;
  
  badgeOffsetX: number;
  badgeOffsetY: number;
  secondBadgeRotation: number;
  secondBadgeOffsetX: number;
  secondBadgeOffsetY: number;
  skipPrintPreview: boolean;
  badgeLayout: BadgeLayoutOptions;
  bottomMargin: number;
  isLoading: boolean;
  
  loadSettings: () => Promise<void>;
  
  setEnableAutomaticPrinting: (enabled: boolean) => void;
  setPrintWithoutDialog: (withoutDialog: boolean) => void;
  setPrintDelay: (delay: number) => void;
  setShowBrandingOnPrint: (show: boolean) => void;
  setBadgePositionX: (position: number) => void;
  setBadgePositionY: (position: number) => void;
  setBadgeRotation: (rotation: number) => void;
  setCompanyLogo: (logo: string | null) => void;
  setShowBuiltByText: (show: boolean) => void;
  setPolicyImageUrl?: (url: string | null) => void;
  
  setBadgeOffsetX: (offset: number) => void;
  setBadgeOffsetY: (offset: number) => void;
  setSecondBadgeRotation: (rotation: number) => void;
  setSecondBadgeOffsetX: (offset: number) => void;
  setSecondBadgeOffsetY: (offset: number) => void;
  setSkipPrintPreview: (skip: boolean) => void;
  setBadgeLayout: (layout: Partial<BadgeLayoutOptions>) => void;
  setBottomMargin: (margin: number) => void;
}

const defaultBadgeLayout: BadgeLayoutOptions = {
  showContact: true,
  showDateTime: true,
  fontSizeTitle: 'medium',
  fontSizeName: 'medium',
  fontSizeCompany: 'medium',
  qrCodeSize: 120,
  footerSpacing: 8,
  qrCodePosition: 'right'
};

// Helper function to sync setting to API
const syncSetting = async (key: string, value: any) => {
  try {
    await apiClient.updateSetting(key, value, 'printer');
  } catch (error) {
    console.error(`Failed to sync setting ${key}:`, error);
  }
};

export const usePrinterSettings = create<PrinterSettingsStore>()(
  persist(
    (set, get) => ({
      enableAutomaticPrinting: false,
      printWithoutDialog: false,
      printDelay: 0,
      showBrandingOnPrint: true,
      badgePositionX: 0,
      badgePositionY: 0,
      badgeRotation: 0,
      companyLogo: null,
      showBuiltByText: true,
      policyImageUrl: null,
      
      badgeOffsetX: 0,
      badgeOffsetY: 0,
      secondBadgeRotation: 0,
      secondBadgeOffsetX: 0,
      secondBadgeOffsetY: 0,
      skipPrintPreview: false,
      bottomMargin: 0,
      badgeLayout: defaultBadgeLayout,
      isLoading: false,
      
      loadSettings: async () => {
        set({ isLoading: true });
        try {
          const response = await apiClient.getSettings('printer');
          if (response.data) {
            const settings = response.data;
            
            set(state => ({
              enableAutomaticPrinting: settings.enableAutomaticPrinting ?? state.enableAutomaticPrinting,
              printWithoutDialog: settings.printWithoutDialog ?? state.printWithoutDialog,
              printDelay: settings.printDelay ?? state.printDelay,
              showBrandingOnPrint: settings.showBrandingOnPrint ?? state.showBrandingOnPrint,
              badgePositionX: settings.badgePositionX ?? state.badgePositionX,
              badgePositionY: settings.badgePositionY ?? state.badgePositionY,
              badgeRotation: settings.badgeRotation ?? state.badgeRotation,
              companyLogo: settings.companyLogo ?? state.companyLogo,
              showBuiltByText: settings.showBuiltByText ?? state.showBuiltByText,
              policyImageUrl: settings.policyImageUrl ?? state.policyImageUrl,
              badgeOffsetX: settings.badgeOffsetX ?? state.badgeOffsetX,
              badgeOffsetY: settings.badgeOffsetY ?? state.badgeOffsetY,
              secondBadgeRotation: settings.secondBadgeRotation ?? state.secondBadgeRotation,
              secondBadgeOffsetX: settings.secondBadgeOffsetX ?? state.secondBadgeOffsetX,
              secondBadgeOffsetY: settings.secondBadgeOffsetY ?? state.secondBadgeOffsetY,
              skipPrintPreview: settings.skipPrintPreview ?? state.skipPrintPreview,
              bottomMargin: settings.bottomMargin ?? state.bottomMargin,
              badgeLayout: settings.badgeLayout ? { ...defaultBadgeLayout, ...settings.badgeLayout } : state.badgeLayout,
            }));
          }
        } catch (error) {
          console.error('Error loading printer settings:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      setEnableAutomaticPrinting: (enabled: boolean) => {
        set({ enableAutomaticPrinting: enabled });
        syncSetting('enableAutomaticPrinting', enabled);
      },
      setPrintWithoutDialog: (withoutDialog: boolean) => {
        set({ printWithoutDialog: withoutDialog });
        syncSetting('printWithoutDialog', withoutDialog);
      },
      setPrintDelay: (delay: number) => {
        set({ printDelay: delay });
        syncSetting('printDelay', delay);
      },
      setShowBrandingOnPrint: (show: boolean) => {
        set({ showBrandingOnPrint: show });
        syncSetting('showBrandingOnPrint', show);
      },
      setBadgePositionX: (position: number) => {
        set({ badgePositionX: position });
        syncSetting('badgePositionX', position);
      },
      setBadgePositionY: (position: number) => {
        set({ badgePositionY: position });
        syncSetting('badgePositionY', position);
      },
      setBadgeRotation: (rotation: number) => {
        set({ badgeRotation: rotation });
        syncSetting('badgeRotation', rotation);
      },
      setCompanyLogo: (logo: string | null) => {
        set({ companyLogo: logo });
        syncSetting('companyLogo', logo);
      },
      setShowBuiltByText: (show: boolean) => {
        set({ showBuiltByText: show });
        syncSetting('showBuiltByText', show);
      },
      setPolicyImageUrl: (url: string | null) => {
        set({ policyImageUrl: url });
        syncSetting('policyImageUrl', url);
      },
      
      setBadgeOffsetX: (offset: number) => {
        set({ badgeOffsetX: offset });
        syncSetting('badgeOffsetX', offset);
      },
      setBadgeOffsetY: (offset: number) => {
        set({ badgeOffsetY: offset });
        syncSetting('badgeOffsetY', offset);
      },
      setSecondBadgeRotation: (rotation: number) => {
        set({ secondBadgeRotation: rotation });
        syncSetting('secondBadgeRotation', rotation);
      },
      setSecondBadgeOffsetX: (offset: number) => {
        set({ secondBadgeOffsetX: offset });
        syncSetting('secondBadgeOffsetX', offset);
      },
      setSecondBadgeOffsetY: (offset: number) => {
        set({ secondBadgeOffsetY: offset });
        syncSetting('secondBadgeOffsetY', offset);
      },
      setSkipPrintPreview: (skip: boolean) => {
        set({ skipPrintPreview: skip });
        syncSetting('skipPrintPreview', skip);
      },
      setBadgeLayout: (layout: Partial<BadgeLayoutOptions>) => {
        set(state => {
          const newLayout = { ...state.badgeLayout, ...layout };
          syncSetting('badgeLayout', newLayout);
          return { badgeLayout: newLayout };
        });
      },
      setBottomMargin: (margin: number) => {
        set({ bottomMargin: margin });
        syncSetting('bottomMargin', margin);
      },
    }),
    {
      name: "printer-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Keep some settings in localStorage as fallback
        skipPrintPreview: state.skipPrintPreview,
        badgeLayout: state.badgeLayout,
      })
    }
  )
);
