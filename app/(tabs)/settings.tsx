import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../src/components/layout';
import { Card } from '../../src/components/ui';
import { useUserStore } from '../../src/stores/useUserStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useThemeColors } from '../../src/hooks/useThemeColors';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { name, birthDate, expectedAge, setProfile } = useUserStore();
  const { language, setLanguage, theme, setTheme } = useSettingsStore();
  const tc = useThemeColors();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(name);
  const [editingBirthDate, setEditingBirthDate] = useState(false);

  const parsedBirth = birthDate ? new Date(birthDate) : null;
  const [dayInput, setDayInput] = useState(parsedBirth ? String(parsedBirth.getDate()) : '');
  const [monthInput, setMonthInput] = useState(parsedBirth ? String(parsedBirth.getMonth() + 1) : '');
  const [yearInput, setYearInput] = useState(parsedBirth ? String(parsedBirth.getFullYear()) : '');

  const saveName = () => { setProfile({ name: nameInput }); setEditingName(false); };
  const saveBirthDate = () => {
    const day = parseInt(dayInput, 10); const month = parseInt(monthInput, 10); const year = parseInt(yearInput, 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= new Date().getFullYear()) {
      setProfile({ birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` });
      setEditingBirthDate(false);
    }
  };
  const formatBirthDate = () => {
    if (!birthDate) return '—';
    const d = new Date(birthDate);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  };

  return (
    <ScreenContainer>
      <Text style={[styles.title, { color: tc.textPrimary }]}>{t('settings.title')}</Text>

      {/* Profile */}
      <Text style={[styles.sectionTitle, { color: tc.accent }]}>{t('settings.profile')}</Text>
      <Card style={styles.sectionCard}>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: tc.textPrimary }]}>{t('settings.name')}</Text>
          {editingName ? (
            <View style={styles.editRow}>
              <TextInput style={[styles.input, { backgroundColor: tc.surfaceElevated, color: tc.textPrimary }]} value={nameInput} onChangeText={setNameInput} placeholder={t('settings.name')} placeholderTextColor={tc.textMuted} autoFocus />
              <TouchableOpacity onPress={saveName}><MaterialCommunityIcons name="check" size={22} color={tc.primary} /></TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditingName(true)} style={styles.valueRow}>
              <Text style={[styles.settingValue, { color: tc.textSecondary }]}>{name || '—'}</Text>
              <MaterialCommunityIcons name="pencil" size={16} color={tc.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <View style={[styles.divider, { backgroundColor: tc.surfaceBorder }]} />
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: tc.textPrimary }]}>{t('settings.birthDate')}</Text>
          {editingBirthDate ? (
            <View style={styles.editRow}>
              <TextInput style={[styles.dateInput, { backgroundColor: tc.surfaceElevated, color: tc.textPrimary }]} value={dayInput} onChangeText={setDayInput} placeholder={t('settings.day')} placeholderTextColor={tc.textMuted} keyboardType="number-pad" maxLength={2} autoFocus />
              <Text style={[styles.dateSeparator, { color: tc.textMuted }]}>/</Text>
              <TextInput style={[styles.dateInput, { backgroundColor: tc.surfaceElevated, color: tc.textPrimary }]} value={monthInput} onChangeText={setMonthInput} placeholder={t('settings.month')} placeholderTextColor={tc.textMuted} keyboardType="number-pad" maxLength={2} />
              <Text style={[styles.dateSeparator, { color: tc.textMuted }]}>/</Text>
              <TextInput style={[styles.dateInput, { backgroundColor: tc.surfaceElevated, color: tc.textPrimary, minWidth: 55 }]} value={yearInput} onChangeText={setYearInput} placeholder={t('settings.year')} placeholderTextColor={tc.textMuted} keyboardType="number-pad" maxLength={4} />
              <TouchableOpacity onPress={saveBirthDate}><MaterialCommunityIcons name="check" size={22} color={tc.primary} /></TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditingBirthDate(true)} style={styles.valueRow}>
              <Text style={[styles.settingValue, { color: tc.textSecondary }]}>{formatBirthDate()}</Text>
              <MaterialCommunityIcons name="pencil" size={16} color={tc.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <View style={[styles.divider, { backgroundColor: tc.surfaceBorder }]} />
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: tc.textPrimary }]}>{t('settings.expectedAge')}</Text>
          <View style={styles.ageRow}>
            <TouchableOpacity onPress={() => setProfile({ expectedAge: Math.max(40, expectedAge - 1) })} style={[styles.ageBtn, { backgroundColor: tc.surfaceElevated }]}>
              <MaterialCommunityIcons name="minus" size={18} color={tc.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.ageValue, { color: tc.accent }]}>{expectedAge}</Text>
            <TouchableOpacity onPress={() => setProfile({ expectedAge: Math.min(100, expectedAge + 1) })} style={[styles.ageBtn, { backgroundColor: tc.surfaceElevated }]}>
              <MaterialCommunityIcons name="plus" size={18} color={tc.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* Preferences */}
      <Text style={[styles.sectionTitle, { color: tc.accent }]}>{t('settings.preferences')}</Text>
      <Card style={styles.sectionCard}>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: tc.textPrimary }]}>{t('settings.language')}</Text>
          <View style={styles.langRow}>
            <TouchableOpacity style={[styles.langBtn, { backgroundColor: tc.surfaceElevated }, language === 'tr' && { backgroundColor: tc.primaryMuted, borderWidth: 1, borderColor: tc.primary }]} onPress={() => setLanguage('tr')}>
              <Text style={[styles.langText, { color: tc.textMuted }, language === 'tr' && { color: tc.primary, fontWeight: '600' }]}>{t('settings.languageTr')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.langBtn, { backgroundColor: tc.surfaceElevated }, language === 'en' && { backgroundColor: tc.primaryMuted, borderWidth: 1, borderColor: tc.primary }]} onPress={() => setLanguage('en')}>
              <Text style={[styles.langText, { color: tc.textMuted }, language === 'en' && { color: tc.primary, fontWeight: '600' }]}>{t('settings.languageEn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: tc.surfaceBorder }]} />
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: tc.textPrimary }]}>{t('settings.theme')}</Text>
          <View style={styles.langRow}>
            <TouchableOpacity style={[styles.themeBtn, { backgroundColor: tc.surfaceElevated }, theme === 'dark' && { backgroundColor: tc.accentMuted, borderWidth: 1, borderColor: tc.accent }]} onPress={() => setTheme('dark')}>
              <MaterialCommunityIcons name="moon-waning-crescent" size={16} color={theme === 'dark' ? tc.accent : tc.textMuted} />
              <Text style={[styles.themeText, { color: tc.textMuted }, theme === 'dark' && { color: tc.accent, fontWeight: '600' }]}>{t('settings.themeDark')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.themeBtn, { backgroundColor: tc.surfaceElevated }, theme === 'light' && { backgroundColor: tc.accentMuted, borderWidth: 1, borderColor: tc.accent }]} onPress={() => setTheme('light')}>
              <MaterialCommunityIcons name="white-balance-sunny" size={16} color={theme === 'light' ? tc.accent : tc.textMuted} />
              <Text style={[styles.themeText, { color: tc.textMuted }, theme === 'light' && { color: tc.accent, fontWeight: '600' }]}>{t('settings.themeLight')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* About */}
      <Text style={[styles.sectionTitle, { color: tc.accent }]}>{t('settings.about')}</Text>
      <Card style={styles.sectionCard}>
        <Text style={[styles.aboutText, { color: tc.textSecondary }]}>{t('settings.aboutText')}</Text>
        <View style={[styles.divider, { backgroundColor: tc.surfaceBorder }]} />
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: tc.textPrimary }]}>{t('settings.version')}</Text>
          <Text style={[styles.settingValue, { color: tc.textSecondary }]}>1.0.0</Text>
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, marginTop: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  sectionCard: { marginBottom: 24, padding: 0 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, minHeight: 48 },
  settingLabel: { fontSize: 15 },
  settingValue: { fontSize: 15 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: { fontSize: 15, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, minWidth: 120 },
  dateInput: { fontSize: 15, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, minWidth: 38, textAlign: 'center' },
  dateSeparator: { fontSize: 16 },
  divider: { height: 1, marginHorizontal: 16 },
  ageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ageBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ageValue: { fontSize: 18, fontWeight: '700', minWidth: 30, textAlign: 'center' },
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  langText: { fontSize: 14 },
  themeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  themeText: { fontSize: 14 },
  aboutText: { fontSize: 14, lineHeight: 20, padding: 16 },
});
