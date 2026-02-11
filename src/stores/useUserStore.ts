import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  name: string;
  birthDate: string | null;
  gender: 'male' | 'female' | null;
  expectedAge: number;
  onboardingCompleted: boolean;
  createdAt: string | null;
  setProfile: (profile: Partial<Omit<UserState, 'setProfile' | 'completeOnboarding' | 'reset'>>) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: '',
      birthDate: null,
      gender: null,
      expectedAge: 63,
      onboardingCompleted: false,
      createdAt: null,
      setProfile: (profile) => set((state) => ({ ...state, ...profile })),
      completeOnboarding: () =>
        set({ onboardingCompleted: true, createdAt: new Date().toISOString() }),
      reset: () =>
        set({
          name: '',
          birthDate: null,
          gender: null,
          expectedAge: 63,
          onboardingCompleted: false,
          createdAt: null,
        }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
