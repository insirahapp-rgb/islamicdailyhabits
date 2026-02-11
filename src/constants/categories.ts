import { TimeCategory } from '../types/tracker';
import { colors } from '../theme/colors';

export const TIME_CATEGORIES: TimeCategory[] = [
  {
    id: 'worship',
    labelKey: 'categories.worship',
    color: colors.worship,
    icon: 'mosque',
    defaultHours: 2,
  },
  {
    id: 'knowledge',
    labelKey: 'categories.knowledge',
    color: colors.knowledge,
    icon: 'book-education',
    defaultHours: 3,
  },
  {
    id: 'sleep',
    labelKey: 'categories.sleep',
    color: colors.sleep,
    icon: 'sleep',
    defaultHours: 7,
  },
  {
    id: 'work',
    labelKey: 'categories.work',
    color: colors.work,
    icon: 'briefcase',
    defaultHours: 8,
  },
  {
    id: 'free_time',
    labelKey: 'categories.freeTime',
    color: colors.freeTime,
    icon: 'gamepad-variant',
    defaultHours: 4,
  },
];
