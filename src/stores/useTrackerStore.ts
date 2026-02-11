import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CategoryId, TimeEntry } from '../types/tracker';

interface TrackerState {
  entries: Record<string, TimeEntry>;
  updateCategory: (date: string, categoryId: CategoryId, hours: number) => void;
  getEntry: (date: string) => TimeEntry | undefined;
  clearEntry: (date: string) => void;
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({
      entries: {},
      updateCategory: (date, categoryId, hours) =>
        set((state) => {
          const existing = state.entries[date] || {
            date,
            categories: { worship: 0, knowledge: 0, sleep: 0, work: 0, free_time: 0 },
          };
          return {
            entries: {
              ...state.entries,
              [date]: {
                ...existing,
                categories: {
                  ...existing.categories,
                  [categoryId]: hours,
                },
              },
            },
          };
        }),
      getEntry: (date) => get().entries[date],
      clearEntry: (date) =>
        set((state) => {
          const { [date]: _, ...rest } = state.entries;
          return { entries: rest };
        }),
    }),
    {
      name: 'tracker-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
