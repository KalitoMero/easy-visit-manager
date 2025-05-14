
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdditionalVisitor = {
  id: string;
  name: string;
  salutation?: string;
  visitorNumber: number;
};

export type Visitor = {
  id: string;
  name: string;
  salutation?: string; // Optional salutation field (Mr., Mrs., Mx.)
  company: string;
  contact: string;
  visitorNumber: number;
  checkInTime: string;
  checkOutTime?: string | null;
  additionalVisitors?: AdditionalVisitor[];
  additionalVisitorCount: number;
  notes?: string;
  policyAccepted?: boolean; // Add missing policyAccepted field
};

type DeletionSchedule = {
  enabled: boolean;
  dayOfWeek: number;
  hour: number;
  minute: number;
  lastRun?: string;
};

type VisitorStore = {
  visitors: Visitor[];
  visitorCounter: number;
  deletionSchedule: DeletionSchedule;
  addVisitor: (name: string, company: string, contact: string, salutation?: string) => Visitor;
  addGroupVisitor: (visitors: Array<{ salutation?: string, name: string }>, company: string, contact: string) => Visitor;
  checkOutVisitor: (id: string) => void;
  getVisitor: (id: string) => Visitor | undefined;
  getVisitorByNumber: (visitorNumber: number) => Visitor | undefined;
  updateVisitor: (id: string, updates: Partial<Omit<Visitor, 'id'>>) => void;
  deleteVisitor: (id: string) => void;
  clearVisitors: () => void;
  searchVisitors: (query: string) => Visitor[];
  acceptPolicy: (id: string) => void;
  updateDeletionSchedule: (enabled: boolean, dayOfWeek: number, hour: number, minute: number) => void;
  deleteOldVisitors: () => number;
  performScheduledCheckout: () => void;
};

// Helper function for auto checkout initialization
export const initializeAutoCheckout = () => {
  // Check out all visitors at 8 PM every day
  const checkTime = () => {
    const now = new Date();
    if (now.getHours() === 20) { // 8 PM
      useVisitorStore.getState().performScheduledCheckout();
    }
  };
  
  // Run check every 5 minutes
  const timer = setInterval(checkTime, 5 * 60 * 1000);
  
  // Return cleanup function
  return () => clearInterval(timer);
};

export const useVisitorStore = create<VisitorStore>()(
  persist(
    (set, get) => ({
      visitors: [],
      visitorCounter: 1000,
      deletionSchedule: {
        enabled: false,
        dayOfWeek: 0, // Sunday
        hour: 3, // 3 AM
        minute: 0,
      },
      
      addVisitor: (name, company, contact, salutation) => {
        const { visitors, visitorCounter } = get();
        const newVisitor: Visitor = {
          id: crypto.randomUUID ? crypto.randomUUID() : `visitor-${Date.now()}`,
          name,
          salutation,
          company,
          contact,
          visitorNumber: visitorCounter,
          checkInTime: new Date().toISOString(),
          additionalVisitorCount: 0,
        };
        
        set({ 
          visitors: [newVisitor, ...visitors],
          visitorCounter: visitorCounter + 1 
        });
        
        return newVisitor;
      },
      
      addGroupVisitor: (visitorList, company, contact) => {
        const { visitors, visitorCounter } = get();
        let currentVisitorNumber = visitorCounter;
        
        // Create the main visitor from the first person in the list
        const mainVisitor = visitorList[0];
        const additionalVisitors = visitorList.slice(1).map((visitor, index) => {
          currentVisitorNumber++;
          return {
            id: crypto.randomUUID ? crypto.randomUUID() : `visitor-add-${Date.now()}-${index}`,
            name: visitor.name,
            salutation: visitor.salutation,
            visitorNumber: currentVisitorNumber
          };
        });
        
        const newVisitor: Visitor = {
          id: crypto.randomUUID ? crypto.randomUUID() : `visitor-${Date.now()}`,
          name: mainVisitor.name,
          salutation: mainVisitor.salutation,
          company,
          contact,
          visitorNumber: visitorCounter,
          checkInTime: new Date().toISOString(),
          additionalVisitors,
          additionalVisitorCount: additionalVisitors.length,
        };
        
        set({ 
          visitors: [newVisitor, ...visitors],
          visitorCounter: currentVisitorNumber + 1
        });
        
        return newVisitor;
      },
      
      checkOutVisitor: (id) => {
        set((state) => ({
          visitors: state.visitors.map((visitor) =>
            visitor.id === id ? { ...visitor, checkOutTime: new Date().toISOString() } : visitor
          ),
        }));
      },

      acceptPolicy: (id) => {
        set((state) => ({
          visitors: state.visitors.map((visitor) =>
            visitor.id === id ? { ...visitor, policyAccepted: true } : visitor
          ),
        }));
      },
      
      getVisitor: (id) => {
        const { visitors } = get();
        return visitors.find((visitor) => visitor.id === id);
      },
      
      getVisitorByNumber: (visitorNumber) => {
        const { visitors } = get();
        return visitors.find((visitor) => visitor.visitorNumber === visitorNumber);
      },
      
      updateVisitor: (id, updates) => {
        set((state) => ({
          visitors: state.visitors.map((visitor) =>
            visitor.id === id ? { ...visitor, ...updates } : visitor
          ),
        }));
      },
      
      deleteVisitor: (id) => {
        set((state) => ({
          visitors: state.visitors.filter((visitor) => visitor.id !== id),
        }));
      },
      
      clearVisitors: () => {
        set({ visitors: [], visitorCounter: 1000 });
      },
      
      searchVisitors: (query) => {
        const { visitors } = get();
        const searchTerm = query.toLowerCase().trim();
        
        return visitors.filter(visitor => {
          const nameMatches = visitor.name.toLowerCase().includes(searchTerm);
          const companyMatches = visitor.company.toLowerCase().includes(searchTerm);
          const contactMatches = visitor.contact.toLowerCase().includes(searchTerm);
          
          return nameMatches || companyMatches || contactMatches;
        });
      },

      updateDeletionSchedule: (enabled, dayOfWeek, hour, minute) => {
        set((state) => ({
          deletionSchedule: {
            ...state.deletionSchedule,
            enabled,
            dayOfWeek,
            hour,
            minute
          }
        }));
      },

      deleteOldVisitors: () => {
        const { visitors } = get();
        const inactiveVisitors = visitors.filter(v => v.checkOutTime !== null);
        
        if (inactiveVisitors.length === 0) {
          return 0;
        }

        set((state) => ({
          visitors: state.visitors.filter((visitor) => visitor.checkOutTime === null),
          deletionSchedule: {
            ...state.deletionSchedule,
            lastRun: new Date().toISOString()
          }
        }));

        return inactiveVisitors.length;
      },

      performScheduledCheckout: () => {
        const today = new Date();
        const hour = today.getHours();
        
        // Auto check out remaining visitors at 8 PM
        if (hour === 20) {
          set((state) => ({
            visitors: state.visitors.map((visitor) =>
              visitor.checkOutTime === null 
                ? { ...visitor, checkOutTime: new Date().toISOString() } 
                : visitor
            ),
          }));
          
          console.log("Performed scheduled checkout at", today.toLocaleTimeString());
        }
      }
    }),
    {
      name: 'visitor-storage'
    }
  )
);
