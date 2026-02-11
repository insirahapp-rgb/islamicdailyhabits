import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui';
import { getWisdomById } from '../../src/utils/dailyWisdom';
import { useWisdomStore } from '../../src/stores/useWisdomStore';

export default function VerseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { bookmarkedIds, toggleBookmark } = useWisdomStore();
  const lang = i18n.language as 'tr' | 'en';

  const item = getWisdomById(id);

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>Not found</Text>
      </SafeAreaView>
    );
  }

  const isBookmarked = bookmarkedIds.includes(item.id);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="close" size={24} color="#B0B0B0" />
          </TouchableOpacity>
          <View style={[styles.typeBadge, item.type === 'quran' ? styles.quranBadge : styles.hadithBadge]}>
            <Text style={styles.typeText}>
              {item.type === 'quran' ? t('wisdom.quran') : t('wisdom.hadith')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
            <MaterialCommunityIcons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={isBookmarked ? '#C9A84C' : '#666666'}
            />
          </TouchableOpacity>
        </View>

        {/* Arabic Text */}
        <Card style={styles.arabicCard}>
          <Text style={styles.arabicText}>{item.arabic}</Text>
        </Card>

        {/* Divider */}
        <View style={styles.ornamentDivider}>
          <View style={styles.dividerLine} />
          <MaterialCommunityIcons name="star-four-points" size={16} color="#C9A84C" />
          <View style={styles.dividerLine} />
        </View>

        {/* Turkish Translation */}
        <Text style={styles.translationLabel}>
          {lang === 'tr' ? 'Türkçe Meal' : 'Turkish Translation'}
        </Text>
        <Text style={styles.translationText}>{item.translations.tr}</Text>

        {/* English Translation */}
        <Text style={[styles.translationLabel, { marginTop: 24 }]}>
          {lang === 'tr' ? 'İngilizce Meal' : 'English Translation'}
        </Text>
        <Text style={styles.translationText}>{item.translations.en}</Text>

        {/* Reference */}
        <View style={styles.referenceContainer}>
          <MaterialCommunityIcons name="book-open-page-variant" size={16} color="#C9A84C" />
          <Text style={styles.referenceText}>{item.reference[lang]}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  container: { flex: 1, padding: 20 },
  notFound: { color: '#666666', fontSize: 16, textAlign: 'center', marginTop: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  quranBadge: { backgroundColor: 'rgba(27, 122, 61, 0.2)' },
  hadithBadge: { backgroundColor: 'rgba(33, 150, 243, 0.2)' },
  typeText: { fontSize: 13, fontWeight: '600', color: '#B0B0B0' },
  arabicCard: { marginBottom: 20, borderColor: 'rgba(201, 168, 76, 0.2)', padding: 24 },
  arabicText: { color: '#E8D5A3', fontSize: 26, lineHeight: 48, textAlign: 'right', writingDirection: 'rtl' },
  ornamentDivider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(201, 168, 76, 0.2)' },
  translationLabel: { color: '#C9A84C', fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  translationText: { color: '#B0B0B0', fontSize: 16, lineHeight: 26 },
  referenceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 32, padding: 16, backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#333333' },
  referenceText: { color: '#C9A84C', fontSize: 14, fontWeight: '500' },
});
