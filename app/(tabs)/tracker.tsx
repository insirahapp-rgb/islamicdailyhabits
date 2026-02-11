import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../src/components/layout';
import { Card, ProgressBar } from '../../src/components/ui';
import { useTrackerStore } from '../../src/stores/useTrackerStore';
import { TIME_CATEGORIES } from '../../src/constants/categories';
import { getToday, addDays, formatDate } from '../../src/utils/dateHelpers';
import { CategoryId } from '../../src/types/tracker';
import Svg, { Path, G, Circle } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_SIZE = SCREEN_WIDTH * 0.5;

export default function TrackerScreen() {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(getToday());
  const { entries, updateCategory } = useTrackerStore();
  const entry = entries[currentDate];

  const categories = entry?.categories || {
    worship: 0,
    knowledge: 0,
    sleep: 0,
    work: 0,
    free_time: 0,
  };

  const totalHours = Object.values(categories).reduce((sum, h) => sum + h, 0);
  const remainingHours = Math.max(0, 24 - totalHours);
  const isOverLimit = totalHours > 24;
  const isToday = currentDate === getToday();

  // Pie chart data
  const pieData = useMemo(() => {
    const data = TIME_CATEGORIES.filter((cat) => (categories[cat.id] || 0) > 0).map((cat) => ({
      ...cat,
      hours: categories[cat.id] || 0,
      percentage: ((categories[cat.id] || 0) / 24) * 100,
    }));
    return data;
  }, [categories]);

  // Simple SVG pie chart
  const renderPieChart = () => {
    if (totalHours === 0) {
      return (
        <View style={styles.chartContainer}>
          <Svg width={CHART_SIZE} height={CHART_SIZE}>
            <Circle cx={CHART_SIZE / 2} cy={CHART_SIZE / 2} r={CHART_SIZE / 2 - 20} fill="none" stroke="#2A2A2A" strokeWidth={30} />
          </Svg>
          <View style={styles.chartCenter}>
            <Text style={styles.chartCenterNumber}>0</Text>
            <Text style={styles.chartCenterLabel}>/ 24 {t('tracker.hoursUnit')}</Text>
          </View>
        </View>
      );
    }

    let cumulativeAngle = -90;
    const paths = pieData.map((item) => {
      const angle = (item.hours / 24) * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;
      const endAngle = cumulativeAngle;

      const cx = CHART_SIZE / 2;
      const cy = CHART_SIZE / 2;
      const r = CHART_SIZE / 2 - 20;
      const innerR = r - 30;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      const largeArc = angle > 180 ? 1 : 0;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);
      const x3 = cx + innerR * Math.cos(endRad);
      const y3 = cy + innerR * Math.sin(endRad);
      const x4 = cx + innerR * Math.cos(startRad);
      const y4 = cy + innerR * Math.sin(startRad);

      const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;

      return <Path key={item.id} d={d} fill={item.color} />;
    });

    return (
      <View style={styles.chartContainer}>
        <Svg width={CHART_SIZE} height={CHART_SIZE}>
          {/* Empty track */}
          <Circle cx={CHART_SIZE / 2} cy={CHART_SIZE / 2} r={CHART_SIZE / 2 - 35} fill="none" stroke="#2A2A2A" strokeWidth={30} />
          <G>{paths}</G>
        </Svg>
        <View style={styles.chartCenter}>
          <Text style={styles.chartCenterNumber}>{totalHours.toFixed(1)}</Text>
          <Text style={styles.chartCenterLabel}>/ 24 {t('tracker.hoursUnit')}</Text>
        </View>
      </View>
    );
  };

  const adjustHours = (catId: CategoryId, delta: number) => {
    const current = categories[catId] || 0;
    const newVal = Math.max(0, Math.min(24, current + delta));
    updateCategory(currentDate, catId, newVal);
  };

  return (
    <ScreenContainer>
      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={() => setCurrentDate(addDays(currentDate, -1))}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#B0B0B0" />
        </TouchableOpacity>
        <View style={styles.dateCenter}>
          <Text style={styles.dateText}>
            {formatDate(new Date(currentDate + 'T00:00:00'), i18n.language)}
          </Text>
          {!isToday && (
            <TouchableOpacity onPress={() => setCurrentDate(getToday())}>
              <Text style={styles.todayButton}>{t('tracker.today')}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => setCurrentDate(addDays(currentDate, 1))}>
          <MaterialCommunityIcons name="chevron-right" size={28} color="#B0B0B0" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{t('tracker.title')}</Text>

      {/* Pie Chart */}
      {renderPieChart()}

      {/* Warning if over limit */}
      {isOverLimit && (
        <View style={styles.warningBar}>
          <MaterialCommunityIcons name="alert" size={16} color="#CF6679" />
          <Text style={styles.warningText}>{t('tracker.overLimit')}</Text>
        </View>
      )}

      {/* Remaining indicator */}
      {!isOverLimit && (
        <Text style={styles.remainingText}>
          {t('tracker.remaining')}: {remainingHours.toFixed(1)} {t('tracker.hoursUnit')}
        </Text>
      )}

      {/* Category Cards */}
      {TIME_CATEGORIES.map((cat) => {
        const hours = categories[cat.id] || 0;
        const progress = (hours / 24) * 100;
        return (
          <Card key={cat.id} style={styles.catCard}>
            <View style={styles.catHeader}>
              <View style={styles.catLeft}>
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <MaterialCommunityIcons name={cat.icon as any} size={20} color={cat.color} />
                <Text style={styles.catName}>{t(cat.labelKey)}</Text>
              </View>
              <View style={styles.catRight}>
                <TouchableOpacity onPress={() => adjustHours(cat.id, -0.5)} style={styles.adjustBtn}>
                  <MaterialCommunityIcons name="minus" size={18} color="#B0B0B0" />
                </TouchableOpacity>
                <Text style={[styles.catHours, { color: cat.color }]}>{hours.toFixed(1)}</Text>
                <TouchableOpacity onPress={() => adjustHours(cat.id, 0.5)} style={styles.adjustBtn}>
                  <MaterialCommunityIcons name="plus" size={18} color="#B0B0B0" />
                </TouchableOpacity>
              </View>
            </View>
            <ProgressBar progress={progress} color={cat.color} height={6} />
          </Card>
        );
      })}

      {/* Motivational text */}
      <Text style={styles.motivationalText}>{t('tracker.everyMinute')}</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  dateCenter: { alignItems: 'center' },
  dateText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  todayButton: { color: '#1B7A3D', fontSize: 13, marginTop: 2 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  chartContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
  chartCenter: { position: 'absolute', alignItems: 'center' },
  chartCenterNumber: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  chartCenterLabel: { color: '#666666', fontSize: 12 },
  warningBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8, backgroundColor: 'rgba(207, 102, 121, 0.15)', borderRadius: 8, marginBottom: 12 },
  warningText: { color: '#CF6679', fontSize: 13, fontWeight: '500' },
  remainingText: { color: '#B0B0B0', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  catCard: { marginBottom: 8, padding: 12 },
  catHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { color: '#FFFFFF', fontSize: 15, fontWeight: '500' },
  catRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  adjustBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#242424', alignItems: 'center', justifyContent: 'center' },
  catHours: { fontSize: 18, fontWeight: '700', minWidth: 35, textAlign: 'center' },
  motivationalText: { color: '#C9A84C', fontSize: 14, textAlign: 'center', fontStyle: 'italic', marginTop: 8, marginBottom: 8 },
});
