
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/apiClient';

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
        set({ isLoading: true });
        try {
          const response = await apiClient.getVisitors();
          if (response.data) {
            set({ visitors: response.data });
          }
        } catch (error) {
          console.error('Error loading visitors:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      loadVisitorCounter: async () => {
        try {
          const response = await apiClient.getVisitorCounter();
          if (response.data) {
            set({ visitorCounter: response.data.value });
          }
        } catch (error) {
          console.error('Error loading visitor counter:', error);
        }
      },
      
      addVisitor: async (firstName, name, company, contact) => {
        const visitorData = {
          firstName,
          name,
          company,
          contact,
          additionalVisitors: []
        };
        
        const response = await apiClient.createVisitor(visitorData);
        if (response.data) {
          set(state => ({ 
            visitors: [response.data, ...state.visitors],
            visitorCounter: response.data.visitorNumber + 1
          }));
          return response.data;
        }
        throw new Error(response.error || 'Failed to create visitor');
      },
      
      addGroupVisitor: async (visitorList, company, contact) => {
        const mainVisitor = visitorList[0];
        const additionalVisitors = visitorList.slice(1);
        
        const visitorData = {
          firstName: mainVisitor.firstName,
          name: mainVisitor.name,
          company,
          contact,
          additionalVisitors
        };
        
        const response = await apiClient.createVisitor(visitorData);
        if (response.data) {
          set(state => ({ 
            visitors: [response.data, ...state.visitors]
          }));
          return response.data;
        }
        throw new Error(response.error || 'Failed to create group visitor');
      },
      
      checkOutVisitor: async (id) => {
        const updates = { checkOutTime: new Date().toISOString() };
        const response = await apiClient.updateVisitor(id, updates);
        
        if (!response.error) {
          set(state => ({
            visitors: state.visitors.map(visitor =>
              visitor.id === id ? { ...visitor, checkOutTime: updates.checkOutTime } : visitor
            )
          }));
        }
      },
      
      acceptPolicy: async (id, signature = null) => {
        const updates = { policyAccepted: true, signature };
        const response = await apiClient.updateVisitor(id, updates);
        
        if (!response.error) {
          set(state => ({
            visitors: state.visitors.map(visitor =>
              visitor.id === id ? { ...visitor, ...updates } : visitor
            )
          }));
        }
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
        const response = await apiClient.updateVisitor(id, updates);
        
        if (!response.error) {
          set(state => ({
            visitors: state.visitors.map(visitor =>
              visitor.id === id ? { ...visitor, ...updates } : visitor
            )
          }));
        }
      },
      
      deleteVisitor: async (id) => {
        const response = await apiClient.deleteVisitor(id);
        
        if (!response.error) {
          set(state => ({
            visitors: state.visitors.filter(visitor => visitor.id !== id)
          }));
        }
      },
      
      clearVisitors: async () => {
        // For now, we'll delete all visitors one by one
        // In a real implementation, you might want to add a bulk delete endpoint
        const { visitors } = get();
        for (const visitor of visitors) {
          await apiClient.deleteVisitor(visitor.id);
        }
        
        await apiClient.updateVisitorCounter(DEFAULT_VISITOR_COUNTER);
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

        // Delete inactive visitors from API
        for (const visitor of inactiveVisitors) {
          await apiClient.deleteVisitor(visitor.id);
        }

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
        
        // Update all active visitors
        for (const visitor of activeVisitors) {
          await apiClient.updateVisitor(visitor.id, { checkOutTime: now });
        }

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
        await apiClient.updateVisitorCounter(newCounter);
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
