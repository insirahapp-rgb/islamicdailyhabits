import { ISLAMIC_AVG_AGE, WEEKS_PER_YEAR } from '../constants/life';

export interface LifeStats {
  ageYears: number;
  ageMonths: number;
  ageDays: number;
  weeksLived: number;
  weeksRemaining: number;
  totalWeeks: number;
  daysLived: number;
  daysRemaining: number;
  percentLived: number;
  remainingYears: number;
  remainingMonths: number;
  remainingDays: number;
  remainingHours: number;
  remainingMinutes: number;
  remainingSeconds: number;
}

export function calculateLifeStats(
  birthDateStr: string,
  expectedAge: number = ISLAMIC_AVG_AGE
): LifeStats {
  const now = new Date();
  const birthDate = new Date(birthDateStr);

  const diffMs = now.getTime() - birthDate.getTime();
  const totalDaysLived = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const ageYears = Math.floor(totalDaysLived / 365.25);
  const ageMonths = Math.floor((totalDaysLived % 365.25) / 30.44);
  const ageDays = Math.floor(totalDaysLived % 30.44);

  const weeksLived = Math.floor(totalDaysLived / 7);
  const totalWeeks = expectedAge * WEEKS_PER_YEAR;
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived);

  const totalExpectedDays = Math.floor(expectedAge * 365.25);
  const daysRemaining = Math.max(0, totalExpectedDays - totalDaysLived);

  const percentLived = Math.min(100, (totalDaysLived / totalExpectedDays) * 100);

  // Calculate remaining time components
  const estimatedDeathDate = new Date(birthDate);
  estimatedDeathDate.setFullYear(estimatedDeathDate.getFullYear() + expectedAge);

  const remainMs = Math.max(0, estimatedDeathDate.getTime() - now.getTime());
  const remainingTotalSeconds = Math.floor(remainMs / 1000);
  const remainingTotalMinutes = Math.floor(remainingTotalSeconds / 60);
  const remainingTotalHours = Math.floor(remainingTotalMinutes / 60);
  const remainingTotalDays = Math.floor(remainingTotalHours / 24);

  const rYears = Math.floor(remainingTotalDays / 365.25);
  const rMonths = Math.floor((remainingTotalDays % 365.25) / 30.44);
  const rDays = Math.floor(remainingTotalDays % 30.44);
  const rHours = remainingTotalHours % 24;
  const rMinutes = remainingTotalMinutes % 60;
  const rSeconds = remainingTotalSeconds % 60;

  return {
    ageYears,
    ageMonths,
    ageDays,
    weeksLived,
    weeksRemaining,
    totalWeeks,
    daysLived: totalDaysLived,
    daysRemaining,
    percentLived: Math.round(percentLived * 10) / 10,
    remainingYears: rYears,
    remainingMonths: rMonths,
    remainingDays: rDays,
    remainingHours: rHours,
    remainingMinutes: rMinutes,
    remainingSeconds: rSeconds,
  };
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}
