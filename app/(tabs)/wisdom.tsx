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
import { WisdomItem } from '../../src/types/verse';

type FilterType = 'all' | 'quran' | 'hadith' | 'bookmarks';

const FILTER_ICONS: Record<FilterType, string> = {
  all: 'book-open-page-variant',
  quran: 'book-cross',
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

  const filteredData = useMemo(() => {
    switch (filter) {
      case 'quran':
        return getVerses();
      case 'hadith':
        return getHadiths();
      case 'bookmarks':
        return getAllWisdom().filter((item) => bookmarkedIds.includes(item.id));
      default:
        return getAllWisdom();
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
              <Text style={styles.typeText}>
                {item.type === 'quran' ? t('wisdom.quran') : t('wisdom.hadith')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
              <MaterialCommunityIcons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isBookmarked ? '#C9A84C' : '#666666'}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.arabicText} numberOfLines={2}>{item.arabic}</Text>
          <View style={styles.verseDivider} />
          <Text style={styles.translationText} numberOfLines={3}>
            {item.translations[lang]}
          </Text>
          <Text style={styles.referenceText}>{item.reference[lang]}</Text>
        </Card>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <>
      {/* Daily Wisdom Banner */}
      <Card style={styles.dailyCard}>
        <View style={styles.dailyHeader}>
          <MaterialCommunityIcons name="star-four-points" size={16} color="#C9A84C" />
          <Text style={styles.dailyLabel}>{t('wisdom.dailyWisdom')}</Text>
          <MaterialCommunityIcons name="star-four-points" size={16} color="#C9A84C" />
        </View>
        <Text style={styles.dailyArabic}>{dailyWisdom.arabic}</Text>
        <View style={styles.verseDivider} />
        <Text style={styles.dailyTranslation}>
          {dailyWisdom.translations[lang]}
        </Text>
        <Text style={styles.dailyReference}>— {dailyWisdom.reference[lang]}</Text>
      </Card>

      {/* Count */}
      <Text style={styles.countText}>
        {t('wisdom.verseCount', { count: filteredData.length })}
      </Text>
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Title Row */}
        <Text style={styles.screenTitle}>{t('wisdom.title')}</Text>

        {/* Full-width Segmented Filter */}
        <View style={styles.segmentedControl}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.segmentTab, filter === f.key && styles.segmentTabActive]}
              onPress={() => setFilter(f.key)}
            >
              <MaterialCommunityIcons
                name={FILTER_ICONS[f.key] as any}
                size={18}
                color={filter === f.key ? '#1B7A3D' : '#666666'}
              />
              <Text style={[styles.segmentText, filter === f.key && styles.segmentTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {filter === 'bookmarks' ? t('wisdom.noBookmarks') : ''}
            </Text>
          }
        />
      </View>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  container: { flex: 1, paddingHorizontal: 16 },
  screenTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginBottom: 12 },
  segmentedControl: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 12, padding: 4, marginBottom: 12, borderWidth: 1, borderColor: '#333333' },
  segmentTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 10 },
  segmentTabActive: { backgroundColor: 'rgba(27, 122, 61, 0.15)' },
  segmentText: { color: '#666666', fontSize: 11, fontWeight: '600' },
  segmentTextActive: { color: '#1B7A3D' },
  dailyCard: { marginBottom: 12, borderColor: 'rgba(201, 168, 76, 0.3)' },
  dailyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 },
  dailyLabel: { color: '#C9A84C', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  dailyArabic: { color: '#E8D5A3', fontSize: 20, lineHeight: 36, textAlign: 'right', writingDirection: 'rtl' },
  verseDivider: { height: 1, backgroundColor: 'rgba(201, 168, 76, 0.2)', marginVertical: 10 },
  dailyTranslation: { color: '#B0B0B0', fontSize: 14, lineHeight: 22 },
  dailyReference: { color: '#666666', fontSize: 12, marginTop: 6, fontStyle: 'italic' },
  countText: { color: '#666666', fontSize: 12, marginBottom: 8 },
  listContent: { paddingBottom: 16 },
  verseCard: { marginBottom: 10, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  quranBadge: { backgroundColor: 'rgba(27, 122, 61, 0.2)' },
  hadithBadge: { backgroundColor: 'rgba(33, 150, 243, 0.2)' },
  typeText: { fontSize: 11, fontWeight: '600', color: '#B0B0B0' },
  arabicText: { color: '#E8D5A3', fontSize: 18, lineHeight: 32, textAlign: 'right', writingDirection: 'rtl' },
  translationText: { color: '#B0B0B0', fontSize: 14, lineHeight: 20 },
  referenceText: { color: '#666666', fontSize: 12, marginTop: 6 },
  emptyText: { color: '#666666', fontSize: 14, textAlign: 'center', marginTop: 40 },
});
