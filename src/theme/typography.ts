import { Platform } from 'react-native';

export const typography = {
  arabicLarge: {
    fontFamily: Platform.OS === 'ios' ? 'AmiriRegular' : 'Amiri-Regular',
    fontSize: 28,
    lineHeight: 48,
  },
  arabicMedium: {
    fontFamily: Platform.OS === 'ios' ? 'AmiriRegular' : 'Amiri-Regular',
    fontSize: 20,
    lineHeight: 36,
  },
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  number: { fontSize: 36, fontWeight: '700' as const, lineHeight: 42 },
  numberSmall: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
};
