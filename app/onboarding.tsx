import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/ui';
import { useUserStore } from '../src/stores/useUserStore';
import { useSettingsStore } from '../src/stores/useSettingsStore';
import { useThemeColors } from '../src/hooks/useThemeColors';

type Step = 'welcome' | 'birthdate' | 'gender';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setProfile, completeOnboarding } = useUserStore();
  const { language, setLanguage } = useSettingsStore();
  const tc = useThemeColors();

  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('1990');
  const [birthMonth, setBirthMonth] = useState('1');
  const [birthDay, setBirthDay] = useState('1');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [expectedAge, setExpectedAge] = useState(63);

  const handleComplete = () => {
    const birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    setProfile({ name, birthDate, gender, expectedAge });
    completeOnboarding();
    router.replace('/(tabs)');
  };

  if (step === 'welcome') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: tc.background }]}>
        <View style={styles.container}>
          <View style={styles.topSection}>
            <MaterialCommunityIcons name="timer-sand" size={80} color={tc.primary} />
            <Text style={[styles.appName, { color: tc.primary }]}>{t('onboarding.appName')}</Text>
            <Text style={[styles.tagline, { color: tc.textSecondary }]}>{t('onboarding.tagline')}</Text>
          </View>
          <View style={styles.langSelector}>
            <TouchableOpacity style={[styles.langOption, { backgroundColor: tc.surface, borderColor: tc.surfaceBorder }, language === 'tr' && { borderColor: tc.primary, backgroundColor: tc.primaryMuted }]} onPress={() => setLanguage('tr')}>
              <Text style={[styles.langOptionText, { color: tc.textMuted }, language === 'tr' && { color: tc.primary }]}>Türkçe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.langOption, { backgroundColor: tc.surface, borderColor: tc.surfaceBorder }, language === 'en' && { borderColor: tc.primary, backgroundColor: tc.primaryMuted }]} onPress={() => setLanguage('en')}>
              <Text style={[styles.langOptionText, { color: tc.textMuted }, language === 'en' && { color: tc.primary }]}>English</Text>
            </TouchableOpacity>
          </View>
          <TextInput style={[styles.nameInput, { backgroundColor: tc.surface, color: tc.textPrimary, borderColor: tc.surfaceBorder }]} value={name} onChangeText={setName} placeholder={t('settings.name')} placeholderTextColor={tc.textMuted} />
          <Button title={t('onboarding.start')} onPress={() => setStep('birthdate')} style={styles.mainButton} />
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'birthdate') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: tc.background }]}>
        <View style={styles.container}>
          <Text style={[styles.stepTitle, { color: tc.textPrimary }]}>{t('onboarding.enterBirthDate')}</Text>
          <Text style={[styles.stepDescription, { color: tc.textSecondary }]}>{t('onboarding.whyBirthDate')}</Text>
          <View style={styles.dateInputRow}>
            {[
              { val: birthDay, set: setBirthDay, ph: '01', max: 2, label: t('lifeCounter.days') },
              { val: birthMonth, set: setBirthMonth, ph: '01', max: 2, label: t('lifeCounter.months') },
              { val: birthYear, set: setBirthYear, ph: '1990', max: 4, label: t('lifeCounter.years') },
            ].map((f, i) => (
              <View key={i} style={styles.dateField}>
                <Text style={[styles.dateLabel, { color: tc.textMuted }]}>{f.label}</Text>
                <TextInput style={[styles.dateInput, { backgroundColor: tc.surface, color: tc.textPrimary, borderColor: tc.surfaceBorder }]} value={f.val} onChangeText={f.set} keyboardType="number-pad" maxLength={f.max} placeholder={f.ph} placeholderTextColor={tc.textMuted} />
              </View>
            ))}
          </View>
          <Button title={t('onboarding.continue')} onPress={() => setStep('gender')} style={styles.mainButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: tc.background }]}>
      <View style={styles.container}>
        <Text style={[styles.stepTitle, { color: tc.textPrimary }]}>{t('onboarding.selectGender')}</Text>
        <View style={styles.genderRow}>
          {(['male', 'female'] as const).map((g) => (
            <TouchableOpacity key={g} style={[styles.genderCard, { backgroundColor: tc.surface, borderColor: tc.surfaceBorder }, gender === g && { borderColor: tc.primary, backgroundColor: tc.primaryMuted }]} onPress={() => setGender(g)}>
              <MaterialCommunityIcons name={g === 'male' ? 'human-male' : 'human-female'} size={48} color={gender === g ? tc.primary : tc.textMuted} />
              <Text style={[styles.genderText, { color: tc.textMuted }, gender === g && { color: tc.primary }]}>{t(`onboarding.${g}`)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.expectedAgeLabel, { color: tc.textPrimary }]}>{t('settings.expectedAge')}: {expectedAge}</Text>
        <Text style={[styles.hadithQuote, { color: tc.accent }]}>{t('onboarding.expectedAgeInfo')}</Text>
        <View style={styles.ageSlider}>
          <TouchableOpacity onPress={() => setExpectedAge(Math.max(40, expectedAge - 1))} style={[styles.ageBtn, { backgroundColor: tc.surface, borderColor: tc.surfaceBorder }]}>
            <MaterialCommunityIcons name="minus" size={24} color={tc.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.ageNumber, { color: tc.accent }]}>{expectedAge}</Text>
          <TouchableOpacity onPress={() => setExpectedAge(Math.min(100, expectedAge + 1))} style={[styles.ageBtn, { backgroundColor: tc.surface, borderColor: tc.surfaceBorder }]}>
            <MaterialCommunityIcons name="plus" size={24} color={tc.textSecondary} />
          </TouchableOpacity>
        </View>
        <Button title={t('onboarding.complete')} onPress={handleComplete} style={styles.mainButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  topSection: { alignItems: 'center', marginBottom: 40 },
  appName: { fontSize: 42, fontWeight: '700', marginTop: 16 },
  tagline: { fontSize: 16, marginTop: 8, textAlign: 'center' },
  langSelector: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  langOption: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  langOptionText: { fontSize: 15, fontWeight: '500' },
  nameInput: { fontSize: 16, padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 24, textAlign: 'center' },
  mainButton: { marginTop: 16 },
  stepTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  stepDescription: { fontSize: 15, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  dateInputRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 24 },
  dateField: { alignItems: 'center' },
  dateLabel: { fontSize: 12, marginBottom: 6 },
  dateInput: { fontSize: 20, fontWeight: '600', padding: 14, borderRadius: 12, borderWidth: 1, textAlign: 'center', width: 80 },
  genderRow: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginBottom: 32 },
  genderCard: { width: 130, height: 130, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 8 },
  genderText: { fontSize: 15, fontWeight: '500' },
  expectedAgeLabel: { fontSize: 16, textAlign: 'center', marginBottom: 8 },
  hadithQuote: { fontSize: 13, textAlign: 'center', fontStyle: 'italic', marginBottom: 16, lineHeight: 20, paddingHorizontal: 20 },
  ageSlider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 24 },
  ageBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  ageNumber: { fontSize: 36, fontWeight: '700' },
});
