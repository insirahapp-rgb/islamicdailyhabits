import { verses } from '../data/verses';
import { hadiths } from '../data/hadiths';
import { WisdomItem } from '../types/verse';

const allWisdom: WisdomItem[] = [...verses, ...hadiths];

export function getDailyWisdom(date: Date = new Date()): WisdomItem {
  const daysSinceEpoch = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const index = daysSinceEpoch % allWisdom.length;
  return allWisdom[index];
}

export function getWisdomById(id: string): WisdomItem | undefined {
  return allWisdom.find((item) => item.id === id);
}

export function getAllWisdom(): WisdomItem[] {
  return allWisdom;
}

export function getVerses(): WisdomItem[] {
  return verses;
}

export function getHadiths(): WisdomItem[] {
  return hadiths;
}
