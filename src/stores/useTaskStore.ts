import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  categoryId?: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface RewardDef {
  id: string;
  requiredStreak: number;
  icon: string;
  titleKey: string;
  descKey: string;
}

export const REWARDS: RewardDef[] = [
  { id: 'sabr', requiredStreak: 3, icon: 'shield-star', titleKey: 'rewards.sabr', descKey: 'rewards.sabrDesc' },
  { id: 'istikrar', requiredStreak: 7, icon: 'star-crescent', titleKey: 'rewards.istikrar', descKey: 'rewards.istikrarDesc' },
  { id: 'azim', requiredStreak: 14, icon: 'trophy', titleKey: 'rewards.azim', descKey: 'rewards.azimDesc' },
  { id: 'mudavemet', requiredStreak: 30, icon: 'crown', titleKey: 'rewards.mudavemet', descKey: 'rewards.mudavemetDesc' },
  { id: 'ihsan', requiredStreak: 60, icon: 'diamond-stone', titleKey: 'rewards.ihsan', descKey: 'rewards.ihsanDesc' },
];

interface TaskState {
  dailyTasks: Record<string, Task[]>;
  customCategories: CustomCategory[];
  earnedRewards: string[];
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;

  addTask: (date: string, text: string, categoryId?: string) => void;
  toggleTask: (date: string, taskId: string) => void;
  removeTask: (date: string, taskId: string) => void;
  addCustomCategory: (name: string, color: string, icon: string) => void;
  removeCustomCategory: (id: string) => void;
  checkAndUpdateStreak: (date: string) => void;
  isDayCompleted: (date: string) => boolean;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

const getPreviousDate = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      dailyTasks: {},
      customCategories: [],
      earnedRewards: [],
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,

      addTask: (date, text, categoryId) =>
        set((state) => ({
          dailyTasks: {
            ...state.dailyTasks,
            [date]: [
              ...(state.dailyTasks[date] || []),
              { id: generateId(), text, completed: false, categoryId },
            ],
          },
        })),

      toggleTask: (date, taskId) =>
        set((state) => {
          const tasks = (state.dailyTasks[date] || []).map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          );
          return {
            dailyTasks: { ...state.dailyTasks, [date]: tasks },
          };
        }),

      removeTask: (date, taskId) =>
        set((state) => ({
          dailyTasks: {
            ...state.dailyTasks,
            [date]: (state.dailyTasks[date] || []).filter((t) => t.id !== taskId),
          },
        })),

      addCustomCategory: (name, color, icon) =>
        set((state) => ({
          customCategories: [
            ...state.customCategories,
            { id: generateId(), name, color, icon },
          ],
        })),

      removeCustomCategory: (id) =>
        set((state) => ({
          customCategories: state.customCategories.filter((c) => c.id !== id),
        })),

      isDayCompleted: (date) => {
        const tasks = get().dailyTasks[date];
        if (!tasks || tasks.length === 0) return false;
        return tasks.every((t) => t.completed);
      },

      checkAndUpdateStreak: (date) =>
        set((state) => {
          const tasks = state.dailyTasks[date];
          if (!tasks || tasks.length === 0) return {};
          const allDone = tasks.every((t) => t.completed);
          if (!allDone) return {};

          const prevDate = getPreviousDate(date);
          let newStreak = 1;

          if (state.lastCompletedDate === prevDate) {
            newStreak = state.currentStreak + 1;
          } else if (state.lastCompletedDate === date) {
            newStreak = state.currentStreak;
          }

          const newEarned = [...state.earnedRewards];
          REWARDS.forEach((r) => {
            if (newStreak >= r.requiredStreak && !newEarned.includes(r.id)) {
              newEarned.push(r.id);
            }
          });

          return {
            currentStreak: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
            lastCompletedDate: date,
            earnedRewards: newEarned,
          };
        }),
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
