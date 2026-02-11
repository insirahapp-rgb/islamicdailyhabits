import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WisdomState {
  bookmarkedIds: string[];
  lastDailyWisdomDate: string;
  lastDailyWisdomId: string;
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
  setDailyWisdom: (date: string, id: string) => void;
}

export const useWisdomStore = create<WisdomState>()(
  persist(
    (set, get) => ({
      bookmarkedIds: [],
      lastDailyWisdomDate: '',
      lastDailyWisdomId: '',
      toggleBookmark: (id) =>
        set((state) => ({
          bookmarkedIds: state.bookmarkedIds.includes(id)
            ? state.bookmarkedIds.filter((i) => i !== id)
            : [...state.bookmarkedIds, id],
        })),
      isBookmarked: (id) => get().bookmarkedIds.includes(id),
      setDailyWisdom: (date, id) =>
        set({ lastDailyWisdomDate: date, lastDailyWisdomId: id }),
    }),
    {
      name: 'wisdom-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
