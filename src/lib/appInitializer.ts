
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';

/**
 * Initialize the application by loading data from the API
 */
export const initializeApp = async () => {
  try {
    console.log('Initializing application...');
    
    // Load visitors from API
    const visitorStore = useVisitorStore.getState();
    await visitorStore.loadVisitors();
    await visitorStore.loadVisitorCounter();
    
    // Load printer settings from API
    const printerStore = usePrinterSettings.getState();
    await printerStore.loadSettings();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // App should still work with localStorage fallbacks
  }
};
