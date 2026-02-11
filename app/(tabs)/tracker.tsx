import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../src/components/layout';
import { Card, ProgressBar } from '../../src/components/ui';
import { useTrackerStore } from '../../src/stores/useTrackerStore';
import { useTaskStore, REWARDS } from '../../src/stores/useTaskStore';
import { TIME_CATEGORIES } from '../../src/constants/categories';
import { getToday, addDays, formatDate } from '../../src/utils/dateHelpers';
import { CategoryId } from '../../src/types/tracker';
import Svg, { Path, G, Circle } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_SIZE = SCREEN_WIDTH * 0.4;

const CUSTOM_COLORS = ['#E91E63', '#00BCD4', '#8BC34A', '#FF5722', '#3F51B5', '#795548'];
const CUSTOM_ICONS = ['star', 'heart', 'run', 'food-apple', 'human-greeting', 'school', 'palette', 'music', 'dumbbell', 'meditation'];

export default function TrackerScreen() {
  const { t, i18n } = useTranslation();
  const [currentDate, setCurrentDate] = useState(getToday());
  const { entries, updateCategory } = useTrackerStore();
  const {
    dailyTasks, customCategories, currentStreak, earnedRewards,
    addTask, toggleTask, removeTask, addCustomCategory, removeCustomCategory, checkAndUpdateStreak,
  } = useTaskStore();

  const [newTaskText, setNewTaskText] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CUSTOM_COLORS[0]);
  const [newCatIcon, setNewCatIcon] = useState(CUSTOM_ICONS[0]);
  const [showTimeSection, setShowTimeSection] = useState(false);

  const entry = entries[currentDate];
  const tasks = dailyTasks[currentDate] || [];
  const completedTasks = tasks.filter((t) => t.completed).length;
  const allTasksDone = tasks.length > 0 && completedTasks === tasks.length;

  const categories = entry?.categories || {
    worship: 0, knowledge: 0, sleep: 0, work: 0, free_time: 0,
  };

  const totalHours = Object.values(categories).reduce((sum, h) => sum + h, 0);
  const remainingHours = Math.max(0, 24 - totalHours);
  const isOverLimit = totalHours > 24;
  const isToday = currentDate === getToday();

  useEffect(() => {
    if (allTasksDone) {
      checkAndUpdateStreak(currentDate);
    }
  }, [allTasksDone, currentDate]);

  const allCategories = useMemo(() => [
    ...TIME_CATEGORIES,
    ...customCategories.map((c) => ({
      id: c.id as CategoryId,
      labelKey: c.name,
      color: c.color,
      icon: c.icon,
      defaultHours: 0,
    })),
  ], [customCategories]);

  const pieData = useMemo(() => {
    return TIME_CATEGORIES.filter((cat) => (categories[cat.id] || 0) > 0).map((cat) => ({
      ...cat, hours: categories[cat.id] || 0, percentage: ((categories[cat.id] || 0) / 24) * 100,
    }));
  }, [categories]);

  const renderPieChart = () => {
    if (totalHours === 0) {
      return (
        <View style={styles.chartContainer}>
          <Svg width={CHART_SIZE} height={CHART_SIZE}>
            <Circle cx={CHART_SIZE / 2} cy={CHART_SIZE / 2} r={CHART_SIZE / 2 - 15} fill="none" stroke="#2A2A2A" strokeWidth={22} />
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
      const r = CHART_SIZE / 2 - 15;
      const innerR = r - 22;
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
          <Circle cx={CHART_SIZE / 2} cy={CHART_SIZE / 2} r={CHART_SIZE / 2 - 26} fill="none" stroke="#2A2A2A" strokeWidth={22} />
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

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      addTask(currentDate, newTaskText.trim());
      setNewTaskText('');
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

      {/* ===== DAILY GOALS SECTION ===== */}
      <Text style={styles.sectionTitle}>{t('tracker.dailyGoals')}</Text>

      {tasks.length > 0 && (
        <Text style={styles.taskProgress}>
          {t('tracker.tasksCompleted', { done: completedTasks, total: tasks.length })}
        </Text>
      )}

      {/* Completion celebration */}
      {allTasksDone && (
        <Card style={styles.completionCard}>
          <MaterialCommunityIcons name="check-decagram" size={28} color="#66BB6A" />
          <Text style={styles.completionText}>{t('tracker.allCompleted')}</Text>
        </Card>
      )}

      {/* Task list */}
      {tasks.map((task) => (
        <TouchableOpacity key={task.id} onPress={() => toggleTask(currentDate, task.id)} activeOpacity={0.7}>
          <View style={[styles.taskRow, task.completed && styles.taskRowDone]}>
            <MaterialCommunityIcons
              name={task.completed ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
              size={22}
              color={task.completed ? '#1B7A3D' : '#666666'}
            />
            <Text style={[styles.taskText, task.completed && styles.taskTextDone]}>{task.text}</Text>
            <TouchableOpacity onPress={() => removeTask(currentDate, task.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="close" size={16} color="#666666" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      {tasks.length === 0 && (
        <Text style={styles.noTasksText}>{t('tracker.noTasks')}</Text>
      )}

      {/* Add task input */}
      <View style={styles.addTaskRow}>
        <TextInput
          style={styles.addTaskInput}
          value={newTaskText}
          onChangeText={setNewTaskText}
          placeholder={t('tracker.addTask')}
          placeholderTextColor="#666666"
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={handleAddTask} style={styles.addTaskBtn}>
          <MaterialCommunityIcons name="plus" size={20} color="#1B7A3D" />
        </TouchableOpacity>
      </View>

      {/* ===== REWARDS SECTION ===== */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{t('rewards.title')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rewardsScroll}>
        {REWARDS.map((reward) => {
          const isEarned = earnedRewards.includes(reward.id);
          return (
            <View key={reward.id} style={[styles.rewardCard, isEarned && styles.rewardCardEarned]}>
              <MaterialCommunityIcons
                name={reward.icon as any}
                size={28}
                color={isEarned ? '#C9A84C' : '#444444'}
              />
              <Text style={[styles.rewardTitle, isEarned && styles.rewardTitleEarned]}>
                {t(reward.titleKey)}
              </Text>
              <Text style={styles.rewardStreak}>
                {reward.requiredStreak} {t('tracker.streakDays', { count: reward.requiredStreak }).split(' ').pop()}
              </Text>
              <Text style={[styles.rewardStatus, isEarned && styles.rewardStatusEarned]}>
                {isEarned ? t('rewards.earned') : t('rewards.locked')}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* ===== TIME ALLOCATION SECTION ===== */}
      <TouchableOpacity
        style={styles.sectionToggle}
        onPress={() => setShowTimeSection(!showTimeSection)}
      >
        <Text style={styles.sectionTitle}>{t('tracker.timeAllocation')}</Text>
        <MaterialCommunityIcons
          name={showTimeSection ? 'chevron-up' : 'chevron-down'}
          size={22}
          color="#C9A84C"
        />
      </TouchableOpacity>

      {showTimeSection && (
        <>
          {renderPieChart()}

          {isOverLimit && (
            <View style={styles.warningBar}>
              <MaterialCommunityIcons name="alert" size={16} color="#CF6679" />
              <Text style={styles.warningText}>{t('tracker.overLimit')}</Text>
            </View>
          )}
          {!isOverLimit && (
            <Text style={styles.remainingText}>
              {t('tracker.remaining')}: {remainingHours.toFixed(1)} {t('tracker.hoursUnit')}
            </Text>
          )}

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

          {/* Custom categories */}
          {customCategories.map((cat) => (
            <Card key={cat.id} style={styles.catCard}>
              <View style={styles.catHeader}>
                <View style={styles.catLeft}>
                  <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                  <MaterialCommunityIcons name={cat.icon as any} size={20} color={cat.color} />
                  <Text style={styles.catName}>{cat.name}</Text>
                </View>
                <TouchableOpacity onPress={() => removeCustomCategory(cat.id)}>
                  <MaterialCommunityIcons name="close-circle-outline" size={20} color="#666666" />
                </TouchableOpacity>
              </View>
            </Card>
          ))}

          {/* Add custom category */}
          {showAddCategory ? (
            <Card style={styles.addCatCard}>
              <TextInput
                style={styles.addCatInput}
                value={newCatName}
                onChangeText={setNewCatName}
                placeholder={t('tracker.categoryName')}
                placeholderTextColor="#666666"
                autoFocus
              />
              <Text style={styles.addCatLabel}>{t('tracker.selectColor')}</Text>
              <View style={styles.colorRow}>
                {CUSTOM_COLORS.map((c) => (
                  <TouchableOpacity key={c} onPress={() => setNewCatColor(c)}>
                    <View style={[styles.colorDot, { backgroundColor: c }, newCatColor === c && styles.colorDotSelected]} />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.addCatLabel}>{t('tracker.selectIcon')}</Text>
              <View style={styles.iconRow}>
                {CUSTOM_ICONS.map((ic) => (
                  <TouchableOpacity key={ic} onPress={() => setNewCatIcon(ic)}>
                    <View style={[styles.iconBtn, newCatIcon === ic && styles.iconBtnSelected]}>
                      <MaterialCommunityIcons name={ic as any} size={18} color={newCatIcon === ic ? '#FFFFFF' : '#999999'} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.addCatActions}>
                <TouchableOpacity onPress={() => setShowAddCategory(false)}>
                  <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddCategory} style={styles.saveCatBtn}>
                  <Text style={styles.saveCatText}>{t('common.save')}</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <TouchableOpacity style={styles.addCatButton} onPress={() => setShowAddCategory(true)}>
              <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#1B7A3D" />
              <Text style={styles.addCatButtonText}>{t('tracker.addCategory')}</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <Text style={styles.motivationalText}>{t('tracker.everyMinute')}</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  dateCenter: { alignItems: 'center' },
  dateText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  todayButton: { color: '#1B7A3D', fontSize: 13, marginTop: 2 },
  streakBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8, marginBottom: 8, backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 152, 0, 0.2)' },
  streakText: { color: '#FF9800', fontSize: 15, fontWeight: '700' },
  sectionTitle: { color: '#C9A84C', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  sectionToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 8 },
  taskProgress: { color: '#B0B0B0', fontSize: 13, marginBottom: 8 },
  completionCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginBottom: 10, backgroundColor: 'rgba(102, 187, 106, 0.1)', borderColor: 'rgba(102, 187, 106, 0.3)', borderWidth: 1, borderRadius: 12 },
  completionText: { color: '#66BB6A', fontSize: 14, fontWeight: '600', flex: 1 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: '#1A1A1A', borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: '#333333' },
  taskRowDone: { borderColor: 'rgba(27, 122, 61, 0.3)', backgroundColor: 'rgba(27, 122, 61, 0.05)' },
  taskText: { color: '#FFFFFF', fontSize: 15, flex: 1 },
  taskTextDone: { color: '#666666', textDecorationLine: 'line-through' },
  noTasksText: { color: '#666666', fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  addTaskRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  addTaskInput: { flex: 1, backgroundColor: '#1A1A1A', color: '#FFFFFF', fontSize: 14, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#333333' },
  addTaskBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(27, 122, 61, 0.15)', alignItems: 'center', justifyContent: 'center' },
  rewardsScroll: { marginBottom: 8 },
  rewardCard: { width: 100, alignItems: 'center', padding: 12, marginRight: 8, backgroundColor: '#1A1A1A', borderRadius: 12, borderWidth: 1, borderColor: '#333333' },
  rewardCardEarned: { borderColor: 'rgba(201, 168, 76, 0.4)', backgroundColor: 'rgba(201, 168, 76, 0.08)' },
  rewardTitle: { color: '#666666', fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 6 },
  rewardTitleEarned: { color: '#C9A84C' },
  rewardStreak: { color: '#555555', fontSize: 10, marginTop: 2 },
  rewardStatus: { color: '#444444', fontSize: 10, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  rewardStatusEarned: { color: '#66BB6A' },
  chartContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 12, position: 'relative' },
  chartCenter: { position: 'absolute', alignItems: 'center' },
  chartCenterNumber: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  chartCenterLabel: { color: '#666666', fontSize: 10 },
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
  addCatButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(27, 122, 61, 0.3)', borderRadius: 10, borderStyle: 'dashed' },
  addCatButtonText: { color: '#1B7A3D', fontSize: 14, fontWeight: '500' },
  addCatCard: { padding: 16, marginBottom: 8 },
  addCatInput: { backgroundColor: '#242424', color: '#FFFFFF', fontSize: 14, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 12 },
  addCatLabel: { color: '#B0B0B0', fontSize: 12, marginBottom: 6 },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotSelected: { borderWidth: 3, borderColor: '#FFFFFF' },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#242424', alignItems: 'center', justifyContent: 'center' },
  iconBtnSelected: { backgroundColor: '#1B7A3D' },
  addCatActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  cancelText: { color: '#666666', fontSize: 14 },
  saveCatBtn: { backgroundColor: '#1B7A3D', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  saveCatText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  motivationalText: { color: '#C9A84C', fontSize: 14, textAlign: 'center', fontStyle: 'italic', marginTop: 8, marginBottom: 8 },
});
