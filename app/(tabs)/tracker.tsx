import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../src/components/layout';
import { Card, ProgressBar } from '../../src/components/ui';
import { useTaskStore, REWARDS } from '../../src/stores/useTaskStore';
import { TIME_CATEGORIES } from '../../src/constants/categories';
import { getToday, addDays, formatDate } from '../../src/utils/dateHelpers';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import Svg, { Path, G, Circle } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_SIZE = SCREEN_WIDTH * 0.4;

const CUSTOM_COLORS = ['#E91E63', '#00BCD4', '#8BC34A', '#FF5722', '#3F51B5', '#795548'];
const CUSTOM_ICONS = ['star', 'heart', 'run', 'food-apple', 'human-greeting', 'school', 'palette', 'music', 'dumbbell', 'meditation'];

export default function TrackerScreen() {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(getToday());
  const {
    dailyTasks, customCategories, currentStreak, earnedRewards,
    addTask, toggleTask, removeTask, addCustomCategory, removeCustomCategory, checkAndUpdateStreak,
  } = useTaskStore();
  const tc = useThemeColors();

  const [newTaskText, setNewTaskText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('worship');
  const [selectedHours, setSelectedHours] = useState(1);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CUSTOM_COLORS[0]);
  const [newCatIcon, setNewCatIcon] = useState(CUSTOM_ICONS[0]);
  const [showTimeSection, setShowTimeSection] = useState(false);

  const tasks = dailyTasks[currentDate] || [];
  const completedTasks = tasks.filter((t) => t.completed).length;
  const allTasksDone = tasks.length > 0 && completedTasks === tasks.length;
  const isToday = currentDate === getToday();

  useEffect(() => {
    if (allTasksDone) { checkAndUpdateStreak(currentDate); }
  }, [allTasksDone, currentDate]);

  const allCategories = useMemo(() => [
    ...TIME_CATEGORIES.map((c) => ({ id: c.id, label: t(c.labelKey), color: c.color, icon: c.icon })),
    ...customCategories.map((c) => ({ id: c.id, label: c.name, color: c.color, icon: c.icon })),
  ], [customCategories, t]);

  const taskBasedCategories = useMemo(() => {
    const result: Record<string, number> = {};
    tasks.forEach((task) => {
      if (task.categoryId && task.hours) {
        result[task.categoryId] = (result[task.categoryId] || 0) + task.hours;
      }
    });
    return result;
  }, [tasks]);

  const totalHours = Object.values(taskBasedCategories).reduce((sum, h) => sum + h, 0);
  const remainingHours = Math.max(0, 24 - totalHours);
  const isOverLimit = totalHours > 24;

  const pieData = useMemo(() => {
    return allCategories
      .filter((cat) => (taskBasedCategories[cat.id] || 0) > 0)
      .map((cat) => ({ ...cat, hours: taskBasedCategories[cat.id] || 0 }));
  }, [taskBasedCategories, allCategories]);

  const getCategoryInfo = (catId: string) => allCategories.find((c) => c.id === catId);

  const renderPieChart = () => {
    if (totalHours === 0) {
      return (
        <View style={styles.chartContainer}>
          <Svg width={CHART_SIZE} height={CHART_SIZE}>
            <Circle cx={CHART_SIZE / 2} cy={CHART_SIZE / 2} r={CHART_SIZE / 2 - 15} fill="none" stroke={tc.chartEmpty} strokeWidth={22} />
          </Svg>
          <View style={styles.chartCenter}>
            <Text style={[styles.chartCenterNumber, { color: tc.textPrimary }]}>0</Text>
            <Text style={[styles.chartCenterLabel, { color: tc.textMuted }]}>/ 24 {t('tracker.hoursUnit')}</Text>
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
      const cx = CHART_SIZE / 2; const cy = CHART_SIZE / 2;
      const r = CHART_SIZE / 2 - 15; const innerR = r - 22;
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      const largeArc = angle > 180 ? 1 : 0;
      const x1 = cx + r * Math.cos(startRad); const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad); const y2 = cy + r * Math.sin(endRad);
      const x3 = cx + innerR * Math.cos(endRad); const y3 = cy + innerR * Math.sin(endRad);
      const x4 = cx + innerR * Math.cos(startRad); const y4 = cy + innerR * Math.sin(startRad);
      const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
      return <Path key={item.id} d={d} fill={item.color} />;
    });
    return (
      <View style={styles.chartContainer}>
        <Svg width={CHART_SIZE} height={CHART_SIZE}>
          <Circle cx={CHART_SIZE / 2} cy={CHART_SIZE / 2} r={CHART_SIZE / 2 - 26} fill="none" stroke={tc.chartEmpty} strokeWidth={22} />
          <G>{paths}</G>
        </Svg>
        <View style={styles.chartCenter}>
          <Text style={[styles.chartCenterNumber, { color: tc.textPrimary }]}>{totalHours.toFixed(1)}</Text>
          <Text style={[styles.chartCenterLabel, { color: tc.textMuted }]}>/ 24 {t('tracker.hoursUnit')}</Text>
        </View>
      </View>
    );
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      addTask(currentDate, newTaskText.trim(), selectedCategoryId, selectedHours);
      setNewTaskText('');
      setSelectedHours(1);
    }
  };

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      addCustomCategory(newCatName.trim(), newCatColor, newCatIcon);
      setNewCatName('');
      setShowAddCategory(false);
    }
  };

  return (
    <ScreenContainer>
      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={() => setCurrentDate(addDays(currentDate, -1))}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={tc.textSecondary} />
        </TouchableOpacity>
        <View style={styles.dateCenter}>
          <Text style={[styles.dateText, { color: tc.textPrimary }]}>
            {formatDate(new Date(currentDate + 'T00:00:00'), i18n.language)}
          </Text>
          {!isToday && (
            <TouchableOpacity onPress={() => setCurrentDate(getToday())}>
              <Text style={[styles.todayButton, { color: tc.primary }]}>{t('tracker.today')}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => setCurrentDate(addDays(currentDate, 1))}>
          <MaterialCommunityIcons name="chevron-right" size={28} color={tc.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Streak Banner */}
      {currentStreak > 0 && (
        <View style={styles.streakBanner}>
          <MaterialCommunityIcons name="fire" size={20} color="#FF9800" />
          <Text style={styles.streakText}>
            {t('tracker.streak')}: {t('tracker.streakDays', { count: currentStreak })}
          </Text>
          <MaterialCommunityIcons name="fire" size={20} color="#FF9800" />
        </View>
      )}

      {/* DAILY GOALS */}
      <Text style={[styles.sectionTitle, { color: tc.accent }]}>{t('tracker.dailyGoals')}</Text>

      {tasks.length > 0 && (
        <Text style={[styles.taskProgress, { color: tc.textSecondary }]}>
          {t('tracker.tasksCompleted', { done: completedTasks, total: tasks.length })}
        </Text>
      )}

      {allTasksDone && (
        <Card style={styles.completionCard}>
          <MaterialCommunityIcons name="check-decagram" size={28} color={tc.success} />
          <Text style={[styles.completionText, { color: tc.success }]}>{t('tracker.allCompleted')}</Text>
        </Card>
      )}

      {/* Task list */}
      {tasks.map((task) => {
        const catInfo = getCategoryInfo(task.categoryId);
        return (
          <TouchableOpacity key={task.id} onPress={() => toggleTask(currentDate, task.id)} activeOpacity={0.7}>
            <View style={[styles.taskRow, { backgroundColor: tc.surface, borderColor: tc.surfaceBorder }, task.completed && { borderColor: tc.primaryMuted, backgroundColor: tc.primaryMuted }]}>
              <MaterialCommunityIcons
                name={task.completed ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                size={22}
                color={task.completed ? tc.primary : tc.textMuted}
              />
              {catInfo && <View style={[styles.taskCatDot, { backgroundColor: catInfo.color }]} />}
              <Text style={[styles.taskText, { color: tc.textPrimary }, task.completed && { color: tc.textMuted, textDecorationLine: 'line-through' }]}>{task.text}</Text>
              {task.hours > 0 && (
                <Text style={[styles.taskHoursLabel, catInfo && { color: catInfo.color }]}>{task.hours}s</Text>
              )}
              <TouchableOpacity onPress={() => removeTask(currentDate, task.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialCommunityIcons name="close" size={16} color={tc.textMuted} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      })}

      {tasks.length === 0 && (
        <Text style={[styles.noTasksText, { color: tc.textMuted }]}>{t('tracker.noTasks')}</Text>
      )}

      {/* Add task form */}
      <Card style={styles.addTaskCard}>
        <View style={styles.addTaskRow}>
          <TextInput
            style={[styles.addTaskInput, { backgroundColor: tc.surfaceElevated, color: tc.textPrimary, borderColor: tc.surfaceBorder }]}
            value={newTaskText}
            onChangeText={setNewTaskText}
            placeholder={t('tracker.addTask')}
            placeholderTextColor={tc.textMuted}
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
          />
          <TouchableOpacity onPress={handleAddTask} style={[styles.addTaskBtn, { backgroundColor: tc.primaryMuted }]}>
            <MaterialCommunityIcons name="plus" size={20} color={tc.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.formLabel, { color: tc.textSecondary }]}>{t('tracker.selectCategory')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {allCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategoryId(cat.id)}
              style={[
                styles.categoryChip,
                { backgroundColor: tc.surfaceElevated, borderColor: tc.surfaceBorder },
                selectedCategoryId === cat.id && { backgroundColor: cat.color + '30', borderColor: cat.color },
              ]}
            >
              <MaterialCommunityIcons name={cat.icon as any} size={16} color={selectedCategoryId === cat.id ? cat.color : tc.textMuted} />
              <Text style={[styles.chipText, { color: tc.textMuted }, selectedCategoryId === cat.id && { color: cat.color }]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={[styles.formLabel, { color: tc.textSecondary }]}>{t('tracker.duration')}</Text>
        <View style={styles.hourStepper}>
          <TouchableOpacity onPress={() => setSelectedHours(Math.max(0.5, selectedHours - 0.5))} style={[styles.stepperBtn, { backgroundColor: tc.surfaceElevated }]}>
            <MaterialCommunityIcons name="minus" size={18} color={tc.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.stepperValue, { color: tc.textPrimary }]}>{selectedHours.toFixed(1)} {t('tracker.hoursUnit')}</Text>
          <TouchableOpacity onPress={() => setSelectedHours(Math.min(12, selectedHours + 0.5))} style={[styles.stepperBtn, { backgroundColor: tc.surfaceElevated }]}>
            <MaterialCommunityIcons name="plus" size={18} color={tc.textSecondary} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* REWARDS */}
      <Text style={[styles.sectionTitle, { color: tc.accent, marginTop: 20 }]}>{t('rewards.title')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rewardsScroll}>
        {REWARDS.map((reward) => {
          const isEarned = earnedRewards.includes(reward.id);
          return (
            <View key={reward.id} style={[styles.rewardCard, { backgroundColor: tc.surface, borderColor: tc.surfaceBorder }, isEarned && { borderColor: tc.accentMuted, backgroundColor: tc.accentMuted }]}>
              <MaterialCommunityIcons name={reward.icon as any} size={28} color={isEarned ? tc.accent : tc.textMuted} />
              <Text style={[styles.rewardTitle, { color: tc.textMuted }, isEarned && { color: tc.accent }]}>{t(reward.titleKey)}</Text>
              <Text style={[styles.rewardStreak, { color: tc.textMuted }]}>
                {reward.requiredStreak} {t('tracker.streakDays', { count: reward.requiredStreak }).split(' ').pop()}
              </Text>
              <Text style={[styles.rewardStatus, { color: tc.textMuted }, isEarned && { color: tc.success }]}>
                {isEarned ? t('rewards.earned') : t('rewards.locked')}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* TIME ALLOCATION */}
      <TouchableOpacity style={styles.sectionToggle} onPress={() => setShowTimeSection(!showTimeSection)}>
        <Text style={[styles.sectionTitle, { color: tc.accent }]}>{t('tracker.timeAllocation')}</Text>
        <MaterialCommunityIcons name={showTimeSection ? 'chevron-up' : 'chevron-down'} size={22} color={tc.accent} />
      </TouchableOpacity>

      {showTimeSection && (
        <>
          {renderPieChart()}
          {isOverLimit && (
            <View style={styles.warningBar}>
              <MaterialCommunityIcons name="alert" size={16} color={tc.error} />
              <Text style={[styles.warningText, { color: tc.error }]}>{t('tracker.overLimit')}</Text>
            </View>
          )}
          {!isOverLimit && (
            <Text style={[styles.remainingText, { color: tc.textSecondary }]}>
              {t('tracker.remaining')}: {remainingHours.toFixed(1)} {t('tracker.hoursUnit')}
            </Text>
          )}

          {TIME_CATEGORIES.map((cat) => {
            const hours = taskBasedCategories[cat.id] || 0;
            return (
              <Card key={cat.id} style={styles.catCard}>
                <View style={styles.catHeader}>
                  <View style={styles.catLeft}>
                    <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                    <MaterialCommunityIcons name={cat.icon as any} size={20} color={cat.color} />
                    <Text style={[styles.catName, { color: tc.textPrimary }]}>{t(cat.labelKey)}</Text>
                  </View>
                  <Text style={[styles.catHours, { color: cat.color }]}>{hours.toFixed(1)}</Text>
                </View>
                <ProgressBar progress={(hours / 24) * 100} color={cat.color} height={6} />
              </Card>
            );
          })}

          {customCategories.map((cat) => {
            const hours = taskBasedCategories[cat.id] || 0;
            return (
              <Card key={cat.id} style={styles.catCard}>
                <View style={styles.catHeader}>
                  <View style={styles.catLeft}>
                    <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                    <MaterialCommunityIcons name={cat.icon as any} size={20} color={cat.color} />
                    <Text style={[styles.catName, { color: tc.textPrimary }]}>{cat.name}</Text>
                  </View>
                  <View style={styles.catRight}>
                    <Text style={[styles.catHours, { color: cat.color }]}>{hours.toFixed(1)}</Text>
                    <TouchableOpacity onPress={() => removeCustomCategory(cat.id)}>
                      <MaterialCommunityIcons name="close-circle-outline" size={20} color={tc.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
                {hours > 0 && <ProgressBar progress={(hours / 24) * 100} color={cat.color} height={6} />}
              </Card>
            );
          })}

          {showAddCategory ? (
            <Card style={styles.addCatCard}>
              <TextInput
                style={[styles.addCatInput, { backgroundColor: tc.surfaceElevated, color: tc.textPrimary }]}
                value={newCatName}
                onChangeText={setNewCatName}
                placeholder={t('tracker.categoryName')}
                placeholderTextColor={tc.textMuted}
                autoFocus
              />
              <Text style={[styles.addCatLabel, { color: tc.textSecondary }]}>{t('tracker.selectColor')}</Text>
              <View style={styles.colorRow}>
                {CUSTOM_COLORS.map((c) => (
                  <TouchableOpacity key={c} onPress={() => setNewCatColor(c)}>
                    <View style={[styles.colorDot, { backgroundColor: c }, newCatColor === c && { borderWidth: 3, borderColor: tc.textPrimary }]} />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.addCatLabel, { color: tc.textSecondary }]}>{t('tracker.selectIcon')}</Text>
              <View style={styles.iconRow}>
                {CUSTOM_ICONS.map((ic) => (
                  <TouchableOpacity key={ic} onPress={() => setNewCatIcon(ic)}>
                    <View style={[styles.iconBtn, { backgroundColor: tc.surfaceElevated }, newCatIcon === ic && { backgroundColor: tc.primary }]}>
                      <MaterialCommunityIcons name={ic as any} size={18} color={newCatIcon === ic ? '#FFFFFF' : tc.textMuted} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.addCatActions}>
                <TouchableOpacity onPress={() => setShowAddCategory(false)}>
                  <Text style={[styles.cancelText, { color: tc.textMuted }]}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddCategory} style={[styles.saveCatBtn, { backgroundColor: tc.primary }]}>
                  <Text style={styles.saveCatText}>{t('common.save')}</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <TouchableOpacity style={[styles.addCatButton, { borderColor: tc.primaryMuted }]} onPress={() => setShowAddCategory(true)}>
              <MaterialCommunityIcons name="plus-circle-outline" size={20} color={tc.primary} />
              <Text style={[styles.addCatButtonText, { color: tc.primary }]}>{t('tracker.addCategory')}</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <Text style={[styles.motivationalText, { color: tc.accent }]}>{t('tracker.everyMinute')}</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  dateCenter: { alignItems: 'center' },
  dateText: { fontSize: 16, fontWeight: '600' },
  todayButton: { fontSize: 13, marginTop: 2 },
  streakBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8, marginBottom: 8, backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 152, 0, 0.2)' },
  streakText: { color: '#FF9800', fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  sectionToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 8 },
  taskProgress: { fontSize: 13, marginBottom: 8 },
  completionCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginBottom: 10 },
  completionText: { fontSize: 14, fontWeight: '600', flex: 1 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, marginBottom: 6, borderWidth: 1 },
  taskCatDot: { width: 8, height: 8, borderRadius: 4 },
  taskText: { fontSize: 15, flex: 1 },
  taskHoursLabel: { fontSize: 12, fontWeight: '600', marginRight: 4 },
  noTasksText: { fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  addTaskCard: { padding: 14, marginBottom: 8 },
  addTaskRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  addTaskInput: { flex: 1, fontSize: 14, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  addTaskBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  formLabel: { fontSize: 12, marginBottom: 6, marginTop: 4 },
  chipScroll: { marginBottom: 8 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '500' },
  hourStepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  stepperBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  stepperValue: { fontSize: 16, fontWeight: '700', minWidth: 80, textAlign: 'center' },
  rewardsScroll: { marginBottom: 8 },
  rewardCard: { width: 100, alignItems: 'center', padding: 12, marginRight: 8, borderRadius: 12, borderWidth: 1 },
  rewardTitle: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 6 },
  rewardStreak: { fontSize: 10, marginTop: 2 },
  rewardStatus: { fontSize: 10, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  chartContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 12, position: 'relative' },
  chartCenter: { position: 'absolute', alignItems: 'center' },
  chartCenterNumber: { fontSize: 18, fontWeight: '700' },
  chartCenterLabel: { fontSize: 10 },
  warningBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8, backgroundColor: 'rgba(207, 102, 121, 0.15)', borderRadius: 8, marginBottom: 12 },
  warningText: { fontSize: 13, fontWeight: '500' },
  remainingText: { fontSize: 14, textAlign: 'center', marginBottom: 12 },
  catCard: { marginBottom: 8, padding: 12 },
  catHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { fontSize: 15, fontWeight: '500' },
  catRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catHours: { fontSize: 18, fontWeight: '700', minWidth: 35, textAlign: 'center' },
  addCatButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, marginBottom: 8, borderWidth: 1, borderRadius: 10, borderStyle: 'dashed' },
  addCatButtonText: { fontSize: 14, fontWeight: '500' },
  addCatCard: { padding: 16, marginBottom: 8 },
  addCatInput: { fontSize: 14, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 12 },
  addCatLabel: { fontSize: 12, marginBottom: 6 },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  addCatActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  cancelText: { fontSize: 14 },
  saveCatBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  saveCatText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  motivationalText: { fontSize: 14, textAlign: 'center', fontStyle: 'italic', marginTop: 8, marginBottom: 8 },
});
