import { useMemo } from 'react';
import { calculateLifeStats, LifeStats } from '../utils/lifeCalculations';

export function useLifeStats(birthDate: string | null, expectedAge: number): LifeStats | null {
  return useMemo(() => {
    if (!birthDate) return null;
    return calculateLifeStats(birthDate, expectedAge);
  }, [birthDate, expectedAge]);
}
