
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

// Helper to check if it's Monday
const isMondayToday = () => {
  return new Date().getDay() === 1; // 0 is Sunday, 1 is Monday
};

// Helper to get today's date as string YYYY-MM-DD
const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

// Helper to format current time
const getCurrentTime = () => {
  return new Date().toISOString();
};

export const useVisitorStore = create<VisitorState>()(
  persist(
    (set, get) => ({
      visitors: [],
      currentVisitorNumber: 1000,
      lastReset: getTodayString(),

      resetVisitorNumberIfNeeded: () => {
        const today = getTodayString();
        const { lastReset } = get();
        const lastResetDate = new Date(lastReset);
        const todayDate = new Date(today);
        
        // Check if it's Monday and we haven't reset today
        if (isMondayToday() && 
            (lastResetDate.getDay() !== 1 || 
             lastReset !== today)) {
          set({ currentVisitorNumber: 1000, lastReset: today });
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
    }
  )
);

// Set up automatic 8 PM checkout
export const initializeAutoCheckout = () => {
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
  return () => clearTimeout(checkoutTimer);
};
