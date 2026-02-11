export type BuiltinCategoryId = 'worship' | 'knowledge' | 'sleep' | 'work' | 'free_time';
export type CategoryId = BuiltinCategoryId | (string & {});

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
