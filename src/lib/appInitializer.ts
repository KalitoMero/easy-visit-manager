
import { useVisitorStore } from '@/hooks/useVisitorStore';

/**
 * Initialize the application - now works completely offline with localStorage
 */
export const initializeApp = async () => {
  try {
    console.log('Initializing application (offline mode)...');
    
    // Data is automatically loaded from localStorage via Zustand persist
    // No need to load from API anymore
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
};
