import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../../src/components/layout';
import { Card } from '../../src/components/ui';
import { useUserStore } from '../../src/stores/useUserStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { name, birthDate, expectedAge, setProfile } = useUserStore();
  const { language, setLanguage } = useSettingsStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(name);

  const saveName = () => {
    setProfile({ name: nameInput });
    setEditingName(false);
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
          <Text style={styles.settingValue}>
            {birthDate ? new Date(birthDate).toLocaleDateString() : '—'}
          </Text>
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
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { backgroundColor: '#242424', color: '#FFFFFF', fontSize: 15, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, minWidth: 120 },
  divider: { height: 1, backgroundColor: '#333333', marginHorizontal: 16 },
  ageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ageBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#242424', alignItems: 'center', justifyContent: 'center' },
  ageValue: { color: '#C9A84C', fontSize: 18, fontWeight: '700', minWidth: 30, textAlign: 'center' },
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: '#242424' },
  langBtnActive: { backgroundColor: 'rgba(27, 122, 61, 0.2)', borderWidth: 1, borderColor: '#1B7A3D' },
  langText: { color: '#666666', fontSize: 14 },
  langTextActive: { color: '#1B7A3D', fontWeight: '600' },
  aboutText: { color: '#B0B0B0', fontSize: 14, lineHeight: 20, padding: 16 },
});
