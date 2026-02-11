import { useState, useEffect, useRef } from 'react';
import { calculateLifeStats, LifeStats } from '../utils/lifeCalculations';

export function useCountdown(birthDate: string | null, expectedAge: number): LifeStats | null {
  const [stats, setStats] = useState<LifeStats | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!birthDate) return;

    const update = () => {
      setStats(calculateLifeStats(birthDate, expectedAge));
    };

    update();
    intervalRef.current = setInterval(update, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [birthDate, expectedAge]);

  return stats;
}
