import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../src/components/layout';
import { Card } from '../../src/components/ui';
import { useUserStore } from '../../src/stores/useUserStore';
import { useCountdown } from '../../src/hooks/useCountdown';
import { formatNumber } from '../../src/utils/lifeCalculations';
import { getDailyWisdom } from '../../src/utils/dailyWisdom';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import Svg, { Circle } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const RING_SIZE = SCREEN_WIDTH * 0.55;
const STROKE_WIDTH = 12;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function LifeCounterScreen() {
  const { t, i18n } = useTranslation();
  const { name, birthDate, expectedAge, onboardingCompleted } = useUserStore();
  const stats = useCountdown(birthDate, expectedAge);
  const tc = useThemeColors();

  if (!onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  const dailyWisdom = getDailyWisdom();
  const lang = i18n.language as 'tr' | 'en';

  if (!stats || !birthDate) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: tc.primary }]}>{t('app.name')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  const strokeDashoffset = CIRCUMFERENCE - (stats.percentLived / 100) * CIRCUMFERENCE;

  // Generate weeks grid data
  const totalWeeks = stats.totalWeeks;
  const weeksLived = stats.weeksLived;
  const COLS = 52;
  const rows = Math.ceil(totalWeeks / COLS);
  const CELL_SIZE = Math.max(3, Math.min(6, (SCREEN_WIDTH - 48) / COLS));
  const GAP = 1;

  return (
    <ScreenContainer>
      {/* Header */}
      <Text style={[styles.title, { color: tc.textPrimary }]}>{t('lifeCounter.title')}</Text>
      {name ? (
        <Text style={[styles.greeting, { color: tc.textSecondary }]}>{t('lifeCounter.greeting', { name })}</Text>
      ) : null}

      {/* Fixed Ummah Lifespan Hadith */}
      <Card style={styles.hadithCard}>
        <Text style={[styles.hadithArabic, { color: tc.textArabic }]}>{t('lifeCounter.ummahHadith')}</Text>
        <View style={[styles.hadithDivider, { backgroundColor: tc.primaryMuted }]} />
        <Text style={[styles.hadithTranslation, { color: tc.textSecondary }]}>{t('lifeCounter.ummahHadithTranslation')}</Text>
        <Text style={[styles.hadithRef, { color: tc.primary }]}>— {t('lifeCounter.ummahHadithRef')}</Text>
      </Card>

      {/* Circular Progress Ring */}
      <View style={styles.ringContainer}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} stroke={tc.chartEmpty} strokeWidth={STROKE_WIDTH} fill="none" />
          <Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS} stroke={tc.primary} strokeWidth={STROKE_WIDTH} fill="none" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={strokeDashoffset} strokeLinecap="round" rotation="-90" origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`} />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={[styles.percentText, { color: tc.accent }]}>{stats.percentLived}%</Text>
          <Text style={[styles.percentLabel, { color: tc.textSecondary }]}>{t('lifeCounter.lived')}</Text>
        </View>
      </View>

      <Text style={[styles.remainingApprox, { color: tc.textSecondary }]}>
        {t('lifeCounter.approxRemaining', { years: stats.remainingYears, months: stats.remainingMonths })}
      </Text>

      {/* Real-time Countdown */}
      <Card style={styles.countdownCard}>
        <View style={styles.countdownRow}>
          {[
            { val: stats.remainingYears, label: t('lifeCounter.years') },
            { val: stats.remainingMonths, label: t('lifeCounter.months') },
            { val: stats.remainingDays, label: t('lifeCounter.days') },
            { val: stats.remainingHours, label: t('lifeCounter.hours') },
            { val: stats.remainingMinutes, label: t('lifeCounter.minutes') },
            { val: String(stats.remainingSeconds).padStart(2, '0'), label: t('lifeCounter.seconds'), isSeconds: true },
          ].map((item, i) => (
            <View key={i} style={styles.countdownItem}>
              <Text style={[styles.countdownNumber, { color: tc.accent }, item.isSeconds && { color: tc.accentLight }]}>
                {item.val}
              </Text>
              <Text style={[styles.countdownLabel, { color: tc.textMuted }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Life Stats Grid */}
      <View style={styles.statsGrid}>
        {[
          { num: formatNumber(stats.weeksLived), label: t('lifeCounter.weeksLived') },
          { num: formatNumber(stats.weeksRemaining), label: t('lifeCounter.weeksRemaining') },
          { num: formatNumber(stats.daysLived), label: t('lifeCounter.daysLived') },
          { num: formatNumber(stats.daysRemaining), label: t('lifeCounter.daysRemaining') },
        ].map((item, i) => (
          <Card key={i} style={styles.statCard}>
            <Text style={[styles.statNumber, { color: tc.textPrimary }]}>{item.num}</Text>
            <Text style={[styles.statLabel, { color: tc.textMuted }]}>{item.label}</Text>
          </Card>
        ))}
      </View>

      {/* Weeks Grid */}
      <Card style={styles.gridCard}>
        <Text style={[styles.gridTitle, { color: tc.textPrimary }]}>{t('lifeCounter.weekGrid')}</Text>
        <Text style={[styles.gridSubtitle, { color: tc.textMuted }]}>{t('lifeCounter.eachSquare')}</Text>
        <View style={styles.weekGrid}>
          {Array.from({ length: Math.min(rows * COLS, totalWeeks) }, (_, i) => {
            const isLived = i < weeksLived;
            const isCurrent = i === weeksLived;
            return (
              <View
                key={i}
                style={[
                  { width: CELL_SIZE, height: CELL_SIZE, margin: GAP / 2, backgroundColor: tc.chartEmpty, borderRadius: 1 },
                  isLived && { backgroundColor: tc.primary },
                  isCurrent && { backgroundColor: tc.accent },
                ]}
              />
            );
          })}
        </View>
        <View style={styles.gridLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: tc.primary }]} />
            <Text style={[styles.legendText, { color: tc.textMuted }]}>{t('lifeCounter.lived')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: tc.accent }]} />
            <Text style={[styles.legendText, { color: tc.textMuted }]}>{t('lifeCounter.remaining')}</Text>
          </View>
        </View>
      </Card>

      {/* Daily Islamic Quote */}
      <Card style={[styles.quoteCard, { borderColor: tc.accentMuted }]}>
        <Text style={[styles.quoteArabic, { color: tc.textArabic }]}>{dailyWisdom.arabic}</Text>
        <View style={[styles.quoteDivider, { backgroundColor: tc.accentMuted }]} />
        <Text style={[styles.quoteTranslation, { color: tc.textSecondary }]}>{dailyWisdom.translations[lang]}</Text>
        <Text style={[styles.quoteReference, { color: tc.textMuted }]}>— {dailyWisdom.reference[lang]}</Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  loadingText: { fontSize: 28, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  greeting: { fontSize: 16, textAlign: 'center', marginTop: 4, marginBottom: 8 },
  hadithCard: { marginTop: 12, marginBottom: 8 },
  hadithArabic: { fontSize: 18, lineHeight: 34, textAlign: 'right', writingDirection: 'rtl' },
  hadithDivider: { height: 1, marginVertical: 10 },
  hadithTranslation: { fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
  hadithRef: { fontSize: 12, marginTop: 6 },
  ringContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 20, position: 'relative' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  percentText: { fontSize: 36, fontWeight: '700' },
  percentLabel: { fontSize: 14, marginTop: 2 },
  remainingApprox: { fontSize: 15, textAlign: 'center', marginBottom: 16 },
  countdownCard: { marginBottom: 16 },
  countdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  countdownItem: { alignItems: 'center', flex: 1 },
  countdownNumber: { fontSize: 22, fontWeight: '700' },
  countdownLabel: { fontSize: 10, marginTop: 4, textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statCard: { width: (SCREEN_WIDTH - 48) / 2, padding: 12 },
  statNumber: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 4 },
  gridCard: { marginBottom: 16 },
  gridTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  gridSubtitle: { fontSize: 12, marginBottom: 12 },
  weekGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridLegend: { flexDirection: 'row', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 12 },
  quoteCard: { marginBottom: 8 },
  quoteArabic: { fontSize: 22, lineHeight: 40, textAlign: 'right', writingDirection: 'rtl' },
  quoteDivider: { height: 1, marginVertical: 12 },
  quoteTranslation: { fontSize: 15, lineHeight: 24 },
  quoteReference: { fontSize: 13, marginTop: 8, fontStyle: 'italic' },
});
