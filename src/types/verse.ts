export type WisdomType = 'quran' | 'hadith';

export interface WisdomItem {
  id: string;
  type: WisdomType;
  arabic: string;
  translations: {
    tr: string;
    en: string;
  };
  reference: {
    tr: string;
    en: string;
  };
  tags: string[];
}
