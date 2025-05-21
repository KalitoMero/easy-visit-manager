import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdditionalVisitor = {
  id: string;
  name: string;
  firstName?: string; // Add firstName field
  visitorNumber: number;
};

export type Visitor = {
  id: string;
  name: string;
  firstName?: string; // Add firstName field
  company: string;
  contact: string;
  visitorNumber: number;
  checkInTime: string;
  checkOutTime?: string | null;
  additionalVisitors?: AdditionalVisitor[];
  additionalVisitorCount: number;
  notes?: string;
  policyAccepted?: boolean;
  signature?: string | null; // Signature as Base64 string
};

type DeletionSchedule = {
  enabled: boolean;
  dayOfWeek: number;
  hour: number;
  minute: number;
  lastRun?: string;
};

type AutoCheckoutSchedule = {
  enabled: boolean;
  hour: number;
  minute: number;
  lastRun?: string;
};

type VisitorStore = {
  visitors: Visitor[];
  visitorCounter: number;
  deletionSchedule: DeletionSchedule;
  autoCheckoutSchedule: AutoCheckoutSchedule;
  addVisitor: (firstName: string, name: string, company: string, contact: string) => Visitor;
  addGroupVisitor: (visitors: Array<{ name: string, firstName?: string }>, company: string, contact: string) => Visitor;
  checkOutVisitor: (id: string) => void;
  getVisitor: (id: string) => Visitor | undefined;
  getVisitorByNumber: (visitorNumber: number) => Visitor | undefined;
  updateVisitor: (id: string, updates: Partial<Omit<Visitor, 'id'>>) => void;
  deleteVisitor: (id: string) => void;
  clearVisitors: () => void;
  searchVisitors: (query: string) => Visitor[];
  acceptPolicy: (id: string, signature?: string | null) => void;
  updateDeletionSchedule: (enabled: boolean, dayOfWeek: number, hour: number, minute: number) => void;
  updateAutoCheckoutSchedule: (enabled: boolean, hour: number, minute: number) => void;
  deleteOldVisitors: () => number;
  checkOutAllVisitors: () => number;
  performScheduledCheckout: () => void;
  performScheduledAutoCheckout: () => void;
  resetVisitorCounter: (newCounter?: number) => void;
  getActiveVisitors: () => Visitor[];
  getInactiveVisitors: () => Visitor[];
  downloadSignature: (id: string) => void;
};

// Helper function for auto checkout initialization
export const initializeAutoCheckout = () => {
  // Check for auto-checkout schedule every 5 minutes
  const checkTime = () => {
    const now = new Date();
    const state = useVisitorStore.getState();
    
    // Check if we need to perform automated checkout based on schedule
    if (state.autoCheckoutSchedule.enabled) {
      const { hour, minute } = state.autoCheckoutSchedule;
      if (now.getHours() === hour && Math.floor(now.getMinutes() / 5) === Math.floor(minute / 5)) {
        state.performScheduledAutoCheckout();
      }
    }
    
    // Legacy 8 PM checkout (can now be removed or replaced)
    if (now.getHours() === 20) { // 8 PM
      state.performScheduledCheckout();
    }
  };
  
  // Run check every 5 minutes
  const timer = setInterval(checkTime, 5 * 60 * 1000);
  
  // Return cleanup function
  return () => clearInterval(timer);
};

// Default values
const DEFAULT_VISITOR_COUNTER = 100;

export const useVisitorStore = create<VisitorStore>()(
  persist(
    (set, get) => ({
      visitors: [],
      visitorCounter: DEFAULT_VISITOR_COUNTER,
      deletionSchedule: {
        enabled: false,
        dayOfWeek: 0, // Sunday
        hour: 3, // 3 AM
        minute: 0,
      },
      autoCheckoutSchedule: {
        enabled: false,
        hour: 17, // 5 PM default
        minute: 0,
        lastRun: undefined
      },
      
      addVisitor: (firstName, name, company, contact) => {
        const { visitors, visitorCounter } = get();
        const newVisitor: Visitor = {
          id: crypto.randomUUID ? crypto.randomUUID() : `visitor-${Date.now()}`,
          name,
          firstName,
          company,
          contact,
          visitorNumber: visitorCounter,
          checkInTime: new Date().toISOString(),
          additionalVisitorCount: 0,
          checkOutTime: null, // Explicitly set to null to mark visitor as active
        };
        
        console.log("Adding new visitor:", newVisitor);
        
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
            firstName: visitor.firstName,
            visitorNumber: currentVisitorNumber
          };
        });
        
        const newVisitor: Visitor = {
          id: crypto.randomUUID ? crypto.randomUUID() : `visitor-${Date.now()}`,
          name: mainVisitor.name,
          firstName: mainVisitor.firstName,
          company,
          contact,
          visitorNumber: visitorCounter,
          checkInTime: new Date().toISOString(),
          additionalVisitors,
          additionalVisitorCount: additionalVisitors.length,
          checkOutTime: null, // Explicitly set to null to mark visitor as active
        };
        
        console.log("Adding new group visitor:", newVisitor);
        
        set({ 
          visitors: [newVisitor, ...visitors],
          visitorCounter: currentVisitorNumber + 1
        });
        
        return newVisitor;
      },
      
      checkOutVisitor: (id) => {
        set((state) => {
          // Find the visitor to check out
          const visitorToCheckOut = state.visitors.find(v => v.id === id);
          if (visitorToCheckOut) {
            console.log(`Checking out visitor ${visitorToCheckOut.visitorNumber}`);
          }
          
          return {
            visitors: state.visitors.map((visitor) =>
              visitor.id === id ? { ...visitor, checkOutTime: new Date().toISOString() } : visitor
            ),
          };
        });
      },
      
      acceptPolicy: (id, signature = null) => {
        console.log(`Accepting policy for visitor ID: ${id} with signature: ${signature ? 'provided' : 'none'}`);
        
        set((state) => {
          // Update only policyAccepted and signature fields, preserving all other fields including checkOutTime
          const updatedVisitors = state.visitors.map((visitor) => {
            if (visitor.id === id) {
              // Keep all existing fields, only update policyAccepted and signature
              return {
                ...visitor,
                policyAccepted: true,
                signature
              };
            }
            return visitor;
          });
          
          // Get the updated visitor for logging
          const updatedVisitor = updatedVisitors.find(v => v.id === id);
          console.log("Visitor after policy acceptance:", updatedVisitor);
          
          return { visitors: updatedVisitors };
        });
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
        console.log(`Updating visitor ${id} with:`, updates);
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
        set({ visitors: [], visitorCounter: DEFAULT_VISITOR_COUNTER });
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

      updateAutoCheckoutSchedule: (enabled, hour, minute) => {
        set((state) => ({
          autoCheckoutSchedule: {
            ...state.autoCheckoutSchedule,
            enabled,
            hour,
            minute,
            lastRun: new Date().toISOString() // Update the last run time
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
      
      checkOutAllVisitors: () => {
        const { visitors } = get();
        const activeVisitors = visitors.filter(v => v.checkOutTime === null);
        
        if (activeVisitors.length === 0) {
          return 0;
        }

        const now = new Date().toISOString();
        
        set((state) => ({
          visitors: state.visitors.map((visitor) => 
            visitor.checkOutTime === null 
              ? { ...visitor, checkOutTime: now } 
              : visitor
          )
        }));

        return activeVisitors.length;
      },
      
      performScheduledCheckout: () => {
        const today = new Date();
        const hour = today.getHours();
        
        // Auto check out remaining visitors at 8 PM
        if (hour === 20) {
          console.log("Performing scheduled checkout at", today.toLocaleTimeString());
          
          set((state) => ({
            visitors: state.visitors.map((visitor) =>
              visitor.checkOutTime === null 
                ? { ...visitor, checkOutTime: new Date().toISOString() } 
                : visitor
            ),
          }));
        }
      },
      
      performScheduledAutoCheckout: () => {
        const now = new Date();
        console.log("Performing auto checkout at", now.toLocaleTimeString());
        
        set((state) => {
          // Check out all active visitors
          const updatedVisitors = state.visitors.map((visitor) =>
            visitor.checkOutTime === null 
              ? { ...visitor, checkOutTime: now.toISOString() } 
              : visitor
          );
          
          // Update the last run time
          return {
            visitors: updatedVisitors,
            autoCheckoutSchedule: {
              ...state.autoCheckoutSchedule,
              lastRun: now.toISOString()
            }
          };
        });
      },
      
      resetVisitorCounter: (newCounter = DEFAULT_VISITOR_COUNTER) => {
        set({ visitorCounter: newCounter });
      },

      // Functions for better separation of active and inactive visitors
      getActiveVisitors: () => {
        return get().visitors.filter(visitor => visitor.checkOutTime === null);
      },
      
      getInactiveVisitors: () => {
        return get().visitors.filter(visitor => visitor.checkOutTime !== null);
      },
      
      // Function to download the signature
      downloadSignature: (id) => {
        const visitor = get().visitors.find(v => v.id === id);
        if (!visitor || !visitor.signature) return;
        
        // Generate filename
        const fileName = `signature_${visitor.name.replace(/\s+/g, '_')}_${visitor.visitorNumber}.png`;
        
        // Create link and trigger download
        const link = document.createElement('a');
        link.href = visitor.signature;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }),
    {
      name: 'visitor-storage',
      onRehydrateStorage: (state) => {
        // Ensure visitor counter starts at least at the default value during initialization
        return (rehydratedState, error) => {
          if (!error && rehydratedState && rehydratedState.visitorCounter < DEFAULT_VISITOR_COUNTER) {
            console.log(`Correcting visitor counter from ${rehydratedState.visitorCounter} to ${DEFAULT_VISITOR_COUNTER}`);
            rehydratedState.visitorCounter = DEFAULT_VISITOR_COUNTER;
          }
        };
      }
    }
  )
);
