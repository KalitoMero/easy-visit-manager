
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminAuthState {
  isAuthenticated: boolean;
  loading: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

// In a real application, you would use a more secure method for storing and verifying passwords
const ADMIN_PASSWORD = "2034"; // Updated password

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      loading: false,
      
      login: (password) => {
        const isCorrect = password === ADMIN_PASSWORD;
        if (isCorrect) {
          set({ isAuthenticated: true });
          console.log("Admin logged in successfully");
        }
        return isCorrect;
      },
      
      logout: () => {
        set({ isAuthenticated: false });
        console.log("Admin logged out");
      },
    }),
    {
      name: 'admin-auth-storage',
      // Improve persistence by storing in localStorage and loading synchronously
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
