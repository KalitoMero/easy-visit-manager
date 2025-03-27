
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Visitor {
  id: string;
  visitorNumber: number;
  name: string;
  company: string;
  contact: string;
  checkInTime: string;
  checkOutTime: string | null;
  policyAccepted: boolean;
}

interface VisitorState {
  visitors: Visitor[];
  currentVisitorNumber: number;
  lastReset: string;
  
  addVisitor: (name: string, company: string, contact: string) => Visitor;
  acceptPolicy: (id: string) => void;
  checkOutVisitor: (visitorNumber: number) => boolean;
  checkOutAllVisitors: () => void;
  getVisitorByNumber: (visitorNumber: number) => Visitor | undefined;
  resetVisitorNumberIfNeeded: () => void;
}

// Helper to get the current week number
const getCurrentWeek = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil(days / 7);
};

// Helper to get current week as string YYYY-WW
const getCurrentWeekString = () => {
  const year = new Date().getFullYear();
  const week = getCurrentWeek();
  return `${year}-${week.toString().padStart(2, '0')}`;
};

// Helper to format current time
const getCurrentTime = () => {
  return new Date().toISOString();
};

export const useVisitorStore = create<VisitorState>()(
  persist(
    (set, get) => ({
      visitors: [],
      currentVisitorNumber: 100, // Start from 100 for three-digit numbers
      lastReset: getCurrentWeekString(),

      resetVisitorNumberIfNeeded: () => {
        const currentWeek = getCurrentWeekString();
        const { lastReset } = get();
        
        // Reset visitor number at the beginning of a new week
        if (lastReset !== currentWeek) {
          set({ currentVisitorNumber: 100, lastReset: currentWeek });
        }
      },

      addVisitor: (name, company, contact) => {
        // First reset visitor number if needed
        get().resetVisitorNumberIfNeeded();
        
        const { visitors, currentVisitorNumber } = get();
        const newVisitor: Visitor = {
          id: crypto.randomUUID(),
          visitorNumber: currentVisitorNumber,
          name,
          company,
          contact,
          checkInTime: getCurrentTime(),
          checkOutTime: null,
          policyAccepted: false,
        };
        
        set({
          visitors: [...visitors, newVisitor],
          currentVisitorNumber: currentVisitorNumber + 1,
        });
        
        return newVisitor;
      },
      
      acceptPolicy: (id) => {
        set(state => ({
          visitors: state.visitors.map(visitor => 
            visitor.id === id 
              ? { ...visitor, policyAccepted: true } 
              : visitor
          ),
        }));
      },
      
      checkOutVisitor: (visitorNumber) => {
        const { visitors } = get();
        const visitorIndex = visitors.findIndex(
          v => v.visitorNumber === visitorNumber && v.checkOutTime === null
        );
        
        if (visitorIndex === -1) return false;
        
        set(state => ({
          visitors: state.visitors.map((visitor, idx) => 
            idx === visitorIndex 
              ? { ...visitor, checkOutTime: getCurrentTime() } 
              : visitor
          ),
        }));
        
        return true;
      },
      
      checkOutAllVisitors: () => {
        const currentTime = getCurrentTime();
        set(state => ({
          visitors: state.visitors.map(visitor => 
            visitor.checkOutTime === null 
              ? { ...visitor, checkOutTime: currentTime } 
              : visitor
          ),
        }));
      },
      
      getVisitorByNumber: (visitorNumber) => {
        return get().visitors.find(v => v.visitorNumber === visitorNumber);
      },
    }),
    {
      name: 'visitor-storage',
      // Enable auto-saving on every state change
      onRehydrateStorage: () => {
        // This function runs after the state has been rehydrated from local storage
        console.log('Visitor data rehydrated from localStorage');
        return (state) => {
          if (state) {
            // Check if we need to reset visitor numbers for a new week
            state.resetVisitorNumberIfNeeded();
          }
        };
      },
    }
  )
);

// Set up automatic 8 PM checkout and background interval saving
export const initializeAutoCheckout = () => {
  // Setup autosave interval every 15 seconds for breathing data
  const autosaveInterval = setInterval(() => {
    // This will trigger a save by accessing the state
    const state = useVisitorStore.getState();
    console.log('Auto-saving visitor data...', new Date().toISOString());
    // Simply accessing state properties will trigger persistence middleware
    state.resetVisitorNumberIfNeeded();
  }, 15000); // Every 15 seconds

  const scheduleCheckout = () => {
    const now = new Date();
    const eightPM = new Date(now);
    eightPM.setHours(20, 0, 0, 0);
    
    let timeUntilCheckout;
    if (now > eightPM) {
      // If it's past 8PM, schedule for tomorrow
      eightPM.setDate(eightPM.getDate() + 1);
    }
    
    timeUntilCheckout = eightPM.getTime() - now.getTime();
    
    return setTimeout(() => {
      useVisitorStore.getState().checkOutAllVisitors();
      // Schedule next checkout
      scheduleCheckout();
    }, timeUntilCheckout);
  };
  
  const checkoutTimer = scheduleCheckout();
  
  // Return a cleanup function that clears both timers
  return () => {
    clearTimeout(checkoutTimer);
    clearInterval(autosaveInterval);
  };
};
