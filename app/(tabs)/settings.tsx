import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../src/components/layout';
import { Card } from '../../src/components/ui';
import { useUserStore } from '../../src/stores/useUserStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { name, birthDate, expectedAge, setProfile } = useUserStore();
  const { language, setLanguage, theme, setTheme } = useSettingsStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(name);
  const [editingBirthDate, setEditingBirthDate] = useState(false);

  const parsedBirth = birthDate ? new Date(birthDate) : null;
  const [dayInput, setDayInput] = useState(parsedBirth ? String(parsedBirth.getDate()) : '');
  const [monthInput, setMonthInput] = useState(parsedBirth ? String(parsedBirth.getMonth() + 1) : '');
  const [yearInput, setYearInput] = useState(parsedBirth ? String(parsedBirth.getFullYear()) : '');

  const saveName = () => {
    setProfile({ name: nameInput });
    setEditingName(false);
  };

  const saveBirthDate = () => {
    const day = parseInt(dayInput, 10);
    const month = parseInt(monthInput, 10);
    const year = parseInt(yearInput, 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= new Date().getFullYear()) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setProfile({ birthDate: dateStr });
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
      <Text style={styles.title}>{t('settings.title')}</Text>

      {/* Profile Section */}
      <Text style={styles.sectionTitle}>{t('settings.profile')}</Text>
      <Card style={styles.sectionCard}>
        {/* Name */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.name')}</Text>
          {editingName ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.input}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder={t('settings.name')}
                placeholderTextColor="#666666"
                autoFocus
              />
              <TouchableOpacity onPress={saveName}>
                <MaterialCommunityIcons name="check" size={22} color="#1B7A3D" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditingName(true)} style={styles.valueRow}>
              <Text style={styles.settingValue}>{name || '—'}</Text>
              <MaterialCommunityIcons name="pencil" size={16} color="#666666" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        {/* Birth Date */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.birthDate')}</Text>
          {editingBirthDate ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.dateInput}
                value={dayInput}
                onChangeText={setDayInput}
                placeholder={t('settings.day')}
                placeholderTextColor="#666666"
                keyboardType="number-pad"
                maxLength={2}
                autoFocus
              />
              <Text style={styles.dateSeparator}>/</Text>
              <TextInput
                style={styles.dateInput}
                value={monthInput}
                onChangeText={setMonthInput}
                placeholder={t('settings.month')}
                placeholderTextColor="#666666"
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.dateSeparator}>/</Text>
              <TextInput
                style={[styles.dateInput, { minWidth: 55 }]}
                value={yearInput}
                onChangeText={setYearInput}
                placeholder={t('settings.year')}
                placeholderTextColor="#666666"
                keyboardType="number-pad"
                maxLength={4}
              />
              <TouchableOpacity onPress={saveBirthDate}>
                <MaterialCommunityIcons name="check" size={22} color="#1B7A3D" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditingBirthDate(true)} style={styles.valueRow}>
              <Text style={styles.settingValue}>{formatBirthDate()}</Text>
              <MaterialCommunityIcons name="pencil" size={16} color="#666666" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        {/* Expected Age */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.expectedAge')}</Text>
          <View style={styles.ageRow}>
            <TouchableOpacity
              onPress={() => setProfile({ expectedAge: Math.max(40, expectedAge - 1) })}
              style={styles.ageBtn}
            >
              <MaterialCommunityIcons name="minus" size={18} color="#B0B0B0" />
            </TouchableOpacity>
            <Text style={styles.ageValue}>{expectedAge}</Text>
            <TouchableOpacity
              onPress={() => setProfile({ expectedAge: Math.min(100, expectedAge + 1) })}
              style={styles.ageBtn}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#B0B0B0" />
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* Preferences Section */}
      <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
      <Card style={styles.sectionCard}>
        {/* Language */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.language')}</Text>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langBtn, language === 'tr' && styles.langBtnActive]}
              onPress={() => setLanguage('tr')}
            >
              <Text style={[styles.langText, language === 'tr' && styles.langTextActive]}>
                {t('settings.languageTr')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
              onPress={() => setLanguage('en')}
            >
              <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
                {t('settings.languageEn')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Theme */}
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.theme')}</Text>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.themeBtn, theme === 'dark' && styles.themeBtnActive]}
              onPress={() => setTheme('dark')}
            >
              <MaterialCommunityIcons name="moon-waning-crescent" size={16} color={theme === 'dark' ? '#C9A84C' : '#666666'} />
              <Text style={[styles.themeText, theme === 'dark' && styles.themeTextActive]}>
                {t('settings.themeDark')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.themeBtn, theme === 'light' && styles.themeBtnActive]}
              onPress={() => setTheme('light')}
            >
              <MaterialCommunityIcons name="white-balance-sunny" size={16} color={theme === 'light' ? '#C9A84C' : '#666666'} />
              <Text style={[styles.themeText, theme === 'light' && styles.themeTextActive]}>
                {t('settings.themeLight')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* About Section */}
      <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
      <Card style={styles.sectionCard}>
        <Text style={styles.aboutText}>{t('settings.aboutText')}</Text>
        <View style={styles.divider} />
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.version')}</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginBottom: 24, marginTop: 8 },
  sectionTitle: { color: '#C9A84C', fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  sectionCard: { marginBottom: 24, padding: 0 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, minHeight: 48 },
  settingLabel: { color: '#FFFFFF', fontSize: 15 },
  settingValue: { color: '#B0B0B0', fontSize: 15 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: { backgroundColor: '#242424', color: '#FFFFFF', fontSize: 15, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, minWidth: 120 },
  dateInput: { backgroundColor: '#242424', color: '#FFFFFF', fontSize: 15, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, minWidth: 38, textAlign: 'center' },
  dateSeparator: { color: '#666666', fontSize: 16 },
  divider: { height: 1, backgroundColor: '#333333', marginHorizontal: 16 },
  ageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ageBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#242424', alignItems: 'center', justifyContent: 'center' },
  ageValue: { color: '#C9A84C', fontSize: 18, fontWeight: '700', minWidth: 30, textAlign: 'center' },
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: '#242424' },
  langBtnActive: { backgroundColor: 'rgba(27, 122, 61, 0.2)', borderWidth: 1, borderColor: '#1B7A3D' },
  langText: { color: '#666666', fontSize: 14 },
  langTextActive: { color: '#1B7A3D', fontWeight: '600' },
  themeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: '#242424' },
  themeBtnActive: { backgroundColor: 'rgba(201, 168, 76, 0.15)', borderWidth: 1, borderColor: '#C9A84C' },
  themeText: { color: '#666666', fontSize: 14 },
  themeTextActive: { color: '#C9A84C', fontWeight: '600' },
  aboutText: { color: '#B0B0B0', fontSize: 14, lineHeight: 20, padding: 16 },
});
