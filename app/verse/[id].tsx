import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui';
import { getWisdomById } from '../../src/utils/dailyWisdom';
import { useWisdomStore } from '../../src/stores/useWisdomStore';
import { useThemeColors } from '../../src/hooks/useThemeColors';

export default function VerseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { bookmarkedIds, toggleBookmark } = useWisdomStore();
  const lang = i18n.language as 'tr' | 'en';
  const tc = useThemeColors();

  const item = getWisdomById(id);

  if (!item) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: tc.background }]}>
        <Text style={[styles.notFound, { color: tc.textMuted }]}>Not found</Text>
      </SafeAreaView>
    );
  }

  const isBookmarked = bookmarkedIds.includes(item.id);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: tc.background }]} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={24} color={tc.textSecondary} />
          </TouchableOpacity>
          <View style={[styles.typeBadge, item.type === 'quran' ? styles.quranBadge : styles.hadithBadge]}>
            <Text style={[styles.typeText, { color: tc.textSecondary }]}>
              {item.type === 'quran' ? t('wisdom.quran') : t('wisdom.hadith')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
            <MaterialCommunityIcons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={24} color={isBookmarked ? tc.accent : tc.textMuted} />
          </TouchableOpacity>
        </View>

        <Card style={[styles.arabicCard, { borderColor: tc.accentMuted }]}>
          <Text style={[styles.arabicText, { color: tc.textArabic }]}>{item.arabic}</Text>
        </Card>

        <View style={styles.ornamentDivider}>
          <View style={[styles.dividerLine, { backgroundColor: tc.accentMuted }]} />
          <MaterialCommunityIcons name="star-four-points" size={16} color={tc.accent} />
          <View style={[styles.dividerLine, { backgroundColor: tc.accentMuted }]} />
        </View>

        <Text style={[styles.translationLabel, { color: tc.accent }]}>
          {lang === 'tr' ? 'Türkçe Meal' : 'Turkish Translation'}
        </Text>
        <Text style={[styles.translationText, { color: tc.textSecondary }]}>{item.translations.tr}</Text>

        <Text style={[styles.translationLabel, { color: tc.accent, marginTop: 24 }]}>
          {lang === 'tr' ? 'İngilizce Meal' : 'English Translation'}
        </Text>
        <Text style={[styles.translationText, { color: tc.textSecondary }]}>{item.translations.en}</Text>

        <View style={[styles.referenceContainer, { backgroundColor: tc.surface, borderColor: tc.surfaceBorder }]}>
          <MaterialCommunityIcons name="book-open-page-variant" size={16} color={tc.accent} />
          <Text style={[styles.referenceText, { color: tc.accent }]}>{item.reference[lang]}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 20 },
  notFound: { fontSize: 16, textAlign: 'center', marginTop: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  quranBadge: { backgroundColor: 'rgba(27, 122, 61, 0.2)' },
  hadithBadge: { backgroundColor: 'rgba(33, 150, 243, 0.2)' },
  typeText: { fontSize: 13, fontWeight: '600' },
  arabicCard: { marginBottom: 20, padding: 24 },
  arabicText: { fontSize: 26, lineHeight: 48, textAlign: 'right', writingDirection: 'rtl' },
  ornamentDivider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1 },
  translationLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  translationText: { fontSize: 16, lineHeight: 26 },
  referenceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 32, padding: 16, borderRadius: 12, borderWidth: 1 },
  referenceText: { fontSize: 14, fontWeight: '500' },
});
