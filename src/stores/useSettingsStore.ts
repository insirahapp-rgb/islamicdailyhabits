import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

type AppLanguage = 'tr' | 'en';
export type AppTheme = 'dark' | 'light';

interface SettingsState {
  language: AppLanguage;
  theme: AppTheme;
  setLanguage: (lang: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: (i18n.language as AppLanguage) || 'tr',
      theme: 'dark' as AppTheme,
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
