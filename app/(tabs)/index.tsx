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

  if (!onboardingCompleted) {
    return <Redirect href="/onboarding" />;
  }

  const dailyWisdom = getDailyWisdom();
  const lang = i18n.language as 'tr' | 'en';

  if (!stats || !birthDate) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>{t('app.name')}</Text>
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
      <Text style={styles.title}>{t('lifeCounter.title')}</Text>
      {name ? (
        <Text style={styles.greeting}>{t('lifeCounter.greeting', { name })}</Text>
      ) : null}

      {/* Circular Progress Ring */}
      <View style={styles.ringContainer}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          {/* Background circle */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke="#2A2A2A"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke="#1B7A3D"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.percentText}>{stats.percentLived}%</Text>
          <Text style={styles.percentLabel}>{t('lifeCounter.lived')}</Text>
        </View>
      </View>

      <Text style={styles.remainingApprox}>
        {t('lifeCounter.approxRemaining', {
          years: stats.remainingYears,
          months: stats.remainingMonths,
        })}
      </Text>

      {/* Real-time Countdown */}
      <Card style={styles.countdownCard}>
        <View style={styles.countdownRow}>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>{stats.remainingYears}</Text>
            <Text style={styles.countdownLabel}>{t('lifeCounter.years')}</Text>
          </View>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>{stats.remainingMonths}</Text>
            <Text style={styles.countdownLabel}>{t('lifeCounter.months')}</Text>
          </View>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>{stats.remainingDays}</Text>
            <Text style={styles.countdownLabel}>{t('lifeCounter.days')}</Text>
          </View>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>{stats.remainingHours}</Text>
            <Text style={styles.countdownLabel}>{t('lifeCounter.hours')}</Text>
          </View>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>{stats.remainingMinutes}</Text>
            <Text style={styles.countdownLabel}>{t('lifeCounter.minutes')}</Text>
          </View>
          <View style={styles.countdownItem}>
            <Text style={[styles.countdownNumber, styles.secondsNumber]}>
              {String(stats.remainingSeconds).padStart(2, '0')}
            </Text>
            <Text style={styles.countdownLabel}>{t('lifeCounter.seconds')}</Text>
          </View>
        </View>
      </Card>

      {/* Life Stats Grid - 4 cards */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{formatNumber(stats.weeksLived)}</Text>
          <Text style={styles.statLabel}>{t('lifeCounter.weeksLived')}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{formatNumber(stats.weeksRemaining)}</Text>
          <Text style={styles.statLabel}>{t('lifeCounter.weeksRemaining')}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{formatNumber(stats.daysLived)}</Text>
          <Text style={styles.statLabel}>{t('lifeCounter.daysLived')}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{formatNumber(stats.daysRemaining)}</Text>
          <Text style={styles.statLabel}>{t('lifeCounter.daysRemaining')}</Text>
        </Card>
      </View>

      {/* Weeks Grid */}
      <Card style={styles.gridCard}>
        <Text style={styles.gridTitle}>{t('lifeCounter.weekGrid')}</Text>
        <Text style={styles.gridSubtitle}>{t('lifeCounter.eachSquare')}</Text>
        <View style={styles.weekGrid}>
          {Array.from({ length: Math.min(rows * COLS, totalWeeks) }, (_, i) => {
            const isLived = i < weeksLived;
            const isCurrent = i === weeksLived;
            return (
              <View
                key={i}
                style={[
                  styles.weekCell,
                  {
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    margin: GAP / 2,
                  },
                  isLived && styles.weekCellLived,
                  isCurrent && styles.weekCellCurrent,
                ]}
              />
            );
          })}
        </View>
        <View style={styles.gridLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.weekCellLived]} />
            <Text style={styles.legendText}>{t('lifeCounter.lived')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.weekCellCurrent]} />
            <Text style={styles.legendText}>{t('lifeCounter.remaining')}</Text>
          </View>
        </View>
      </Card>

      {/* Islamic Quote */}
      <Card style={styles.quoteCard}>
        <Text style={styles.quoteArabic}>{dailyWisdom.arabic}</Text>
        <View style={styles.quoteDivider} />
        <Text style={styles.quoteTranslation}>
          {dailyWisdom.translations[lang]}
        </Text>
        <Text style={styles.quoteReference}>
          — {dailyWisdom.reference[lang]}
        </Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  loadingText: { color: '#1B7A3D', fontSize: 28, fontWeight: '700' },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  greeting: { color: '#B0B0B0', fontSize: 16, textAlign: 'center', marginTop: 4, marginBottom: 8 },
  ringContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 20, position: 'relative' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  percentText: { color: '#C9A84C', fontSize: 36, fontWeight: '700' },
  percentLabel: { color: '#B0B0B0', fontSize: 14, marginTop: 2 },
  remainingApprox: { color: '#B0B0B0', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  countdownCard: { marginBottom: 16 },
  countdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  countdownItem: { alignItems: 'center', flex: 1 },
  countdownNumber: { color: '#C9A84C', fontSize: 22, fontWeight: '700' },
  secondsNumber: { color: '#E0C76A' },
  countdownLabel: { color: '#666666', fontSize: 10, marginTop: 4, textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statCard: { width: (SCREEN_WIDTH - 48) / 2, padding: 12 },
  statNumber: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  statLabel: { color: '#666666', fontSize: 11, marginTop: 4 },
  gridCard: { marginBottom: 16 },
  gridTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  gridSubtitle: { color: '#666666', fontSize: 12, marginBottom: 12 },
  weekGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekCell: { backgroundColor: '#2A2A2A', borderRadius: 1 },
  weekCellLived: { backgroundColor: '#1B7A3D' },
  weekCellCurrent: { backgroundColor: '#C9A84C' },
  gridLegend: { flexDirection: 'row', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 2 },
  legendText: { color: '#666666', fontSize: 12 },
  quoteCard: { marginBottom: 8, borderColor: 'rgba(201, 168, 76, 0.3)' },
  quoteArabic: { color: '#E8D5A3', fontSize: 22, lineHeight: 40, textAlign: 'right', writingDirection: 'rtl' },
  quoteDivider: { height: 1, backgroundColor: 'rgba(201, 168, 76, 0.2)', marginVertical: 12 },
  quoteTranslation: { color: '#B0B0B0', fontSize: 15, lineHeight: 24 },
  quoteReference: { color: '#666666', fontSize: 13, marginTop: 8, fontStyle: 'italic' },
});
