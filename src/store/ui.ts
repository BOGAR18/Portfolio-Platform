import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type Locale = 'en' | 'id';

interface UiState {
  theme: Theme;
  locale: Locale;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
}

// persist() menyimpan preferensi ke localStorage agar tetap ada setelah refresh
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'system',
      locale: 'en',
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'ui-preferences' },
  ),
);