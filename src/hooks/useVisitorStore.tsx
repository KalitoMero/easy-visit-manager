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
  lastAutoCheckout: string; // Neue Eigenschaft für das letzte automatische Abmelden
  
  addVisitor: (name: string, company: string, contact: string) => Visitor;
  acceptPolicy: (id: string) => void;
  checkOutVisitor: (visitorNumber: number) => boolean;
  checkOutAllVisitors: () => void;
  getVisitorByNumber: (visitorNumber: number) => Visitor | undefined;
  resetVisitorNumberIfNeeded: () => void;
  performScheduledCheckout: () => void; // Neue Funktion für den täglichen Checkout
}

// Helper to get the current week number (ISO week-numbering year)
const getISOWeek = () => {
  const date = new Date();
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// Helper to get current week as string YYYY-WW (ISO format)
const getCurrentWeekString = () => {
  const date = new Date();
  const year = date.getUTCFullYear();
  const week = getISOWeek();
  return `${year}-${week.toString().padStart(2, '0')}`;
};

// Helper to format current time
const getCurrentTime = () => {
  return new Date().toISOString();
};

// Helper to get current date as string YYYY-MM-DD
const getCurrentDateString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
};

export const useVisitorStore = create<VisitorState>()(
  persist(
    (set, get) => ({
      visitors: [],
      currentVisitorNumber: 100, // Start from 100 for three-digit numbers
      lastReset: getCurrentWeekString(),
      lastAutoCheckout: '', // Startwert

      resetVisitorNumberIfNeeded: () => {
        const currentWeek = getCurrentWeekString();
        const { lastReset } = get();
        
        // Reset visitor number at the beginning of a new week
        if (lastReset !== currentWeek) {
          console.log(`Zurücksetzen der Besuchernummer: Neue Woche erkannt (${lastReset} -> ${currentWeek})`);
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

      performScheduledCheckout: () => {
        const currentDate = getCurrentDateString();
        const { lastAutoCheckout } = get();
        
        // Nur einmal täglich ausführen
        if (lastAutoCheckout !== currentDate) {
          // Alle aktiven Besucher abmelden
          get().checkOutAllVisitors();
          // Datum des letzten Checkouts aktualisieren
          set({ lastAutoCheckout: currentDate });
          console.log('Täglicher automatischer Checkout am', currentDate, 'durchgeführt');
        } else {
          console.log('Täglicher Checkout bereits durchgeführt am', lastAutoCheckout);
        }
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
  // Sofort prüfen, ob heute bereits ein Auto-Checkout durchgeführt wurde
  setTimeout(() => {
    const now = new Date();
    const eightPM = new Date(now);
    eightPM.setHours(20, 0, 0, 0);
    
    // Wenn es nach 20 Uhr ist, prüfen ob der automatische Checkout bereits durchgeführt wurde
    if (now >= eightPM) {
      useVisitorStore.getState().performScheduledCheckout();
    }
  }, 1000);

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
    if (now >= eightPM) {
      // If it's past 8PM, schedule for tomorrow
      eightPM.setDate(eightPM.getDate() + 1);
    }
    
    timeUntilCheckout = eightPM.getTime() - now.getTime();
    console.log(`Nächster automatischer Checkout in ${Math.round(timeUntilCheckout/1000/60)} Minuten geplant`);
    
    return setTimeout(() => {
      console.log('Automatischer Checkout um 20 Uhr wird ausgeführt...');
      useVisitorStore.getState().performScheduledCheckout();
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
