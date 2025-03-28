
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Verfügbare Sprachen
export type Language = 'de' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

// Zustand für die Spracheinstellung
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      // Standardsprache ist Deutsch
      language: 'de',
      
      // Funktion zum Ändern der Sprache
      setLanguage: (language: Language) => {
        set({ language });
      },
    }),
    {
      name: 'language-storage',
    }
  )
);
