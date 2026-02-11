import { useMemo } from 'react';
import { getDailyWisdom } from '../utils/dailyWisdom';
import { WisdomItem } from '../types/verse';

export function useDailyWisdom(): WisdomItem {
  return useMemo(() => getDailyWisdom(), []);
}
