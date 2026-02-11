import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui';
import { AdBanner } from '../../src/components/ui/AdBanner';
import { useWisdomStore } from '../../src/stores/useWisdomStore';
import { useDailyWisdom } from '../../src/hooks/useDailyWisdom';
import { getAllWisdom, getVerses, getHadiths } from '../../src/utils/dailyWisdom';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { WisdomItem } from '../../src/types/verse';

type FilterType = 'all' | 'quran' | 'hadith' | 'bookmarks';

const FILTER_ICONS: Record<FilterType, string> = {
  all: 'book-open-page-variant',
  quran: 'book-open',
  hadith: 'script-text',
  bookmarks: 'bookmark-multiple',
};

export default function WisdomScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const { bookmarkedIds, toggleBookmark } = useWisdomStore();
  const dailyWisdom = useDailyWisdom();
  const lang = i18n.language as 'tr' | 'en';
  const tc = useThemeColors();

  const filteredData = useMemo(() => {
    switch (filter) {
      case 'quran': return getVerses();
      case 'hadith': return getHadiths();
      case 'bookmarks': return getAllWisdom().filter((item) => bookmarkedIds.includes(item.id));
      default: return getAllWisdom();
    }
  }, [filter, bookmarkedIds]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: t('wisdom.all') },
    { key: 'quran', label: t('wisdom.quran') },
    { key: 'hadith', label: t('wisdom.hadith') },
    { key: 'bookmarks', label: t('wisdom.bookmarks') },
  ];

  const renderItem = ({ item }: { item: WisdomItem }) => {
    const isBookmarked = bookmarkedIds.includes(item.id);
    return (
      <TouchableOpacity onPress={() => router.push(`/verse/${item.id}`)}>
        <Card style={styles.verseCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.typeBadge, item.type === 'quran' ? styles.quranBadge : styles.hadithBadge]}>
              <Text style={[styles.typeText, { color: tc.textSecondary }]}>
                {item.type === 'quran' ? t('wisdom.quran') : t('wisdom.hadith')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
              <MaterialCommunityIcons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={isBookmarked ? tc.accent : tc.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.arabicText, { color: tc.textArabic }]} numberOfLines={2}>{item.arabic}</Text>
          <View style={[styles.verseDivider, { backgroundColor: tc.accentMuted }]} />
          <Text style={[styles.translationText, { color: tc.textSecondary }]} numberOfLines={3}>{item.translations[lang]}</Text>
          <Text style={[styles.referenceText, { color: tc.textMuted }]}>{item.reference[lang]}</Text>
        </Card>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <>
      <Card style={[styles.dailyCard, { borderColor: tc.accentMuted }]}>
        <View style={styles.dailyHeader}>
          <MaterialCommunityIcons name="star-four-points" size={16} color={tc.accent} />
          <Text style={[styles.dailyLabel, { color: tc.accent }]}>{t('wisdom.dailyWisdom')}</Text>
          <MaterialCommunityIcons name="star-four-points" size={16} color={tc.accent} />
        </View>
        <Text style={[styles.dailyArabic, { color: tc.textArabic }]}>{dailyWisdom.arabic}</Text>
        <View style={[styles.verseDivider, { backgroundColor: tc.accentMuted }]} />
        <Text style={[styles.dailyTranslation, { color: tc.textSecondary }]}>{dailyWisdom.translations[lang]}</Text>
        <Text style={[styles.dailyReference, { color: tc.textMuted }]}>— {dailyWisdom.reference[lang]}</Text>
      </Card>
      <Text style={[styles.countText, { color: tc.textMuted }]}>{t('wisdom.verseCount', { count: filteredData.length })}</Text>
    </>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: tc.background }]} edges={['top']}>
      <View style={styles.container}>
        <Text style={[styles.screenTitle, { color: tc.textPrimary }]}>{t('wisdom.title')}</Text>
        <View style={[styles.segmentedControl, { backgroundColor: tc.surface, borderColor: tc.surfaceBorder }]}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.segmentTab, filter === f.key && { backgroundColor: tc.primaryMuted }]}
              onPress={() => setFilter(f.key)}
            >
              <MaterialCommunityIcons name={FILTER_ICONS[f.key] as any} size={18} color={filter === f.key ? tc.primary : tc.textMuted} />
              <Text style={[styles.segmentText, { color: tc.textMuted }, filter === f.key && { color: tc.primary }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: tc.textMuted }]}>{filter === 'bookmarks' ? t('wisdom.noBookmarks') : ''}</Text>}
        />
      </View>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16 },
  screenTitle: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  segmentedControl: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 12, borderWidth: 1 },
  segmentTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 10 },
  segmentText: { fontSize: 11, fontWeight: '600' },
  dailyCard: { marginBottom: 12 },
  dailyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 },
  dailyLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  dailyArabic: { fontSize: 20, lineHeight: 36, textAlign: 'right', writingDirection: 'rtl' },
  verseDivider: { height: 1, marginVertical: 10 },
  dailyTranslation: { fontSize: 14, lineHeight: 22 },
  dailyReference: { fontSize: 12, marginTop: 6, fontStyle: 'italic' },
  countText: { fontSize: 12, marginBottom: 8 },
  listContent: { paddingBottom: 16 },
  verseCard: { marginBottom: 10, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  quranBadge: { backgroundColor: 'rgba(27, 122, 61, 0.2)' },
  hadithBadge: { backgroundColor: 'rgba(33, 150, 243, 0.2)' },
  typeText: { fontSize: 11, fontWeight: '600' },
  arabicText: { fontSize: 18, lineHeight: 32, textAlign: 'right', writingDirection: 'rtl' },
  translationText: { fontSize: 14, lineHeight: 20 },
  referenceText: { fontSize: 12, marginTop: 6 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 40 },
});
