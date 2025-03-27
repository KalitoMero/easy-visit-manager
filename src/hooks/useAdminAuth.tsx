
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminAuthState {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

// In a real application, you would use a more secure method for storing and verifying passwords
const ADMIN_PASSWORD = "2034"; // Updated password

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      
      login: (password) => {
        const isCorrect = password === ADMIN_PASSWORD;
        if (isCorrect) {
          set({ isAuthenticated: true });
        }
        return isCorrect;
      },
      
      logout: () => {
        set({ isAuthenticated: false });
      },
    }),
    {
      name: 'admin-auth-storage',
    }
  )
);
