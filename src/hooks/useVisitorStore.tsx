
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateUUID } from '@/utils/uuid';

export type AdditionalVisitor = {
  id: string;
  name: string;
  firstName?: string;
  visitorNumber: number;
};

export type Visitor = {
  id: string;
  name: string;
  firstName?: string;
  company: string;
  contact: string;
  visitorNumber: number;
  checkInTime: string;
  checkOutTime?: string | null;
  additionalVisitors?: AdditionalVisitor[];
  additionalVisitorCount: number;
  notes?: string;
  policyAccepted?: boolean;
  signature?: string | null;
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
  isLoading: boolean;
  deletionSchedule: DeletionSchedule;
  autoCheckoutSchedule: AutoCheckoutSchedule;
  
  // API methods
  loadVisitors: () => Promise<void>;
  addVisitor: (firstName: string, name: string, company: string, contact: string) => Promise<Visitor>;
  addGroupVisitor: (visitors: Array<{ name: string, firstName?: string }>, company: string, contact: string) => Promise<Visitor>;
  checkOutVisitor: (id: string) => Promise<void>;
  getVisitor: (id: string) => Visitor | undefined;
  getVisitorByNumber: (visitorNumber: number) => Visitor | undefined;
  updateVisitor: (id: string, updates: Partial<Omit<Visitor, 'id'>>) => Promise<void>;
  deleteVisitor: (id: string) => Promise<void>;
  clearVisitors: () => Promise<void>;
  searchVisitors: (query: string) => Visitor[];
  acceptPolicy: (id: string, signature?: string | null) => Promise<void>;
  updateDeletionSchedule: (enabled: boolean, dayOfWeek: number, hour: number, minute: number) => void;
  updateAutoCheckoutSchedule: (enabled: boolean, hour: number, minute: number) => void;
  deleteOldVisitors: () => Promise<number>;
  checkOutAllVisitors: () => Promise<number>;
  performScheduledCheckout: () => void;
  performScheduledAutoCheckout: () => void;
  resetVisitorCounter: (newCounter?: number) => Promise<void>;
  getActiveVisitors: () => Visitor[];
  getInactiveVisitors: () => Visitor[];
  downloadSignature: (id: string) => void;
  
  // Utility methods
  loadVisitorCounter: () => Promise<void>;
};

const DEFAULT_VISITOR_COUNTER = 100;

export const useVisitorStore = create<VisitorStore>()(
  persist(
    (set, get) => ({
      visitors: [],
      visitorCounter: DEFAULT_VISITOR_COUNTER,
      isLoading: false,
      deletionSchedule: {
        enabled: false,
        dayOfWeek: 0,
        hour: 3,
        minute: 0,
      },
      autoCheckoutSchedule: {
        enabled: false,
        hour: 17,
        minute: 0,
        lastRun: undefined
      },
      
      loadVisitors: async () => {
        // No need to load from API, data is already in state from persist
        set({ isLoading: false });
      },

      loadVisitorCounter: async () => {
        // No need to load from API, counter is already in state from persist
      },
      
      addVisitor: async (firstName, name, company, contact) => {
        const state = get();
        const newVisitor: Visitor = {
          id: generateUUID(),
          firstName,
          name,
          company,
          contact,
          visitorNumber: state.visitorCounter,
          checkInTime: new Date().toISOString(),
          checkOutTime: null,
          additionalVisitors: [],
          additionalVisitorCount: 0,
          policyAccepted: false,
          signature: null
        };
        
        set(state => ({ 
          visitors: [newVisitor, ...state.visitors],
          visitorCounter: state.visitorCounter + 1
        }));
        
        return newVisitor;
      },
      
      addGroupVisitor: async (visitorList, company, contact) => {
        const state = get();
        const mainVisitor = visitorList[0];
        const additionalVisitors = visitorList.slice(1).map((visitor, index) => ({
          id: generateUUID(),
          name: visitor.name,
          firstName: visitor.firstName,
          visitorNumber: state.visitorCounter + index + 1
        }));
        
        const newVisitor: Visitor = {
          id: generateUUID(),
          firstName: mainVisitor.firstName,
          name: mainVisitor.name,
          company,
          contact,
          visitorNumber: state.visitorCounter,
          checkInTime: new Date().toISOString(),
          checkOutTime: null,
          additionalVisitors,
          additionalVisitorCount: additionalVisitors.length,
          policyAccepted: false,
          signature: null
        };
        
        set(state => ({ 
          visitors: [newVisitor, ...state.visitors],
          visitorCounter: state.visitorCounter + additionalVisitors.length + 1
        }));
        
        return newVisitor;
      },
      
      checkOutVisitor: async (id) => {
        const checkOutTime = new Date().toISOString();
        set(state => ({
          visitors: state.visitors.map(visitor =>
            visitor.id === id ? { ...visitor, checkOutTime } : visitor
          )
        }));
      },
      
      acceptPolicy: async (id, signature = null) => {
        set(state => ({
          visitors: state.visitors.map(visitor =>
            visitor.id === id ? { ...visitor, policyAccepted: true, signature } : visitor
          )
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
      
      updateVisitor: async (id, updates) => {
        set(state => ({
          visitors: state.visitors.map(visitor =>
            visitor.id === id ? { ...visitor, ...updates } : visitor
          )
        }));
      },
      
      deleteVisitor: async (id) => {
        set(state => ({
          visitors: state.visitors.filter(visitor => visitor.id !== id)
        }));
      },
      
      clearVisitors: async () => {
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
        set(state => ({
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
        set(state => ({
          autoCheckoutSchedule: {
            ...state.autoCheckoutSchedule,
            enabled,
            hour,
            minute,
            lastRun: new Date().toISOString()
          }
        }));
      },
      
      deleteOldVisitors: async () => {
        const { visitors } = get();
        const inactiveVisitors = visitors.filter(v => v.checkOutTime !== null);
        
        if (inactiveVisitors.length === 0) {
          return 0;
        }

        // Remove inactive visitors locally

        set(state => ({
          visitors: state.visitors.filter(visitor => visitor.checkOutTime === null),
          deletionSchedule: {
            ...state.deletionSchedule,
            lastRun: new Date().toISOString()
          }
        }));

        return inactiveVisitors.length;
      },
      
      checkOutAllVisitors: async () => {
        const { visitors } = get();
        const activeVisitors = visitors.filter(v => v.checkOutTime === null);
        
        if (activeVisitors.length === 0) {
          return 0;
        }

        const now = new Date().toISOString();
        
        // Update all active visitors locally

        set(state => ({
          visitors: state.visitors.map(visitor => 
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
        
        if (hour === 20) {
          console.log("Performing scheduled checkout at", today.toLocaleTimeString());
          get().checkOutAllVisitors();
        }
      },
      
      performScheduledAutoCheckout: () => {
        const now = new Date();
        console.log("Performing auto checkout at", now.toLocaleTimeString());
        get().checkOutAllVisitors();
      },
      
      resetVisitorCounter: async (newCounter = DEFAULT_VISITOR_COUNTER) => {
        set({ visitorCounter: newCounter });
      },

      getActiveVisitors: () => {
        return get().visitors.filter(visitor => visitor.checkOutTime === null);
      },
      
      getInactiveVisitors: () => {
        return get().visitors.filter(visitor => visitor.checkOutTime !== null);
      },
      
      downloadSignature: (id) => {
        const visitor = get().visitors.find(v => v.id === id);
        if (!visitor || !visitor.signature) return;
        
        const fileName = `signature_${visitor.name.replace(/\s+/g, '_')}_${visitor.visitorNumber}.png`;
        
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
      partialize: (state) => ({
        visitors: state.visitors,
        visitorCounter: state.visitorCounter,
        deletionSchedule: state.deletionSchedule,
        autoCheckoutSchedule: state.autoCheckoutSchedule,
      })
    }
  )
);

// Initialize auto checkout
export const initializeAutoCheckout = () => {
  const checkTime = () => {
    const now = new Date();
    const state = useVisitorStore.getState();
    
    if (state.autoCheckoutSchedule.enabled) {
      const { hour, minute } = state.autoCheckoutSchedule;
      if (now.getHours() === hour && Math.floor(now.getMinutes() / 5) === Math.floor(minute / 5)) {
        state.performScheduledAutoCheckout();
      }
    }
    
    if (now.getHours() === 20) {
      state.performScheduledCheckout();
    }
  };
  
  const timer = setInterval(checkTime, 5 * 60 * 1000);
  return () => clearInterval(timer);
};
