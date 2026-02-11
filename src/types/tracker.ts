export type CategoryId = 'worship' | 'knowledge' | 'sleep' | 'work' | 'free_time';

export interface TimeCategory {
  id: CategoryId;
  labelKey: string;
  color: string;
  icon: string;
  defaultHours: number;
}

export interface TimeEntry {
  date: string;
  categories: Record<CategoryId, number>;
  note?: string;
}
