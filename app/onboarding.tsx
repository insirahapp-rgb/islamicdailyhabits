import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/ui';
import { useUserStore } from '../src/stores/useUserStore';
import { useSettingsStore } from '../src/stores/useSettingsStore';

type Step = 'welcome' | 'birthdate' | 'gender';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setProfile, completeOnboarding } = useUserStore();
  const { language, setLanguage } = useSettingsStore();

  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('1990');
  const [birthMonth, setBirthMonth] = useState('1');
  const [birthDay, setBirthDay] = useState('1');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [expectedAge, setExpectedAge] = useState(63);

  const handleComplete = () => {
    const birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    setProfile({
      name,
      birthDate,
      gender,
      expectedAge,
    });
    completeOnboarding();
    router.replace('/(tabs)');
  };

  if (step === 'welcome') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.topSection}>
            <MaterialCommunityIcons name="timer-sand" size={80} color="#1B7A3D" />
            <Text style={styles.appName}>{t('onboarding.appName')}</Text>
            <Text style={styles.tagline}>{t('onboarding.tagline')}</Text>
          </View>

          {/* Language Selector */}
          <View style={styles.langSelector}>
            <TouchableOpacity
              style={[styles.langOption, language === 'tr' && styles.langOptionActive]}
              onPress={() => setLanguage('tr')}
            >
              <Text style={[styles.langOptionText, language === 'tr' && styles.langOptionTextActive]}>Türkçe</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langOption, language === 'en' && styles.langOptionActive]}
              onPress={() => setLanguage('en')}
            >
              <Text style={[styles.langOptionText, language === 'en' && styles.langOptionTextActive]}>English</Text>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder={t('settings.name')}
            placeholderTextColor="#666666"
          />

          <Button title={t('onboarding.start')} onPress={() => setStep('birthdate')} style={styles.mainButton} />
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'birthdate') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.stepTitle}>{t('onboarding.enterBirthDate')}</Text>
          <Text style={styles.stepDescription}>{t('onboarding.whyBirthDate')}</Text>

          <View style={styles.dateInputRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>{t('lifeCounter.days')}</Text>
              <TextInput
                style={styles.dateInput}
                value={birthDay}
                onChangeText={setBirthDay}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="01"
                placeholderTextColor="#666"
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>{t('lifeCounter.months')}</Text>
              <TextInput
                style={styles.dateInput}
                value={birthMonth}
                onChangeText={setBirthMonth}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="01"
                placeholderTextColor="#666"
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>{t('lifeCounter.years')}</Text>
              <TextInput
                style={styles.dateInput}
                value={birthYear}
                onChangeText={setBirthYear}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="1990"
                placeholderTextColor="#666"
              />
            </View>
          </View>

          <Button title={t('onboarding.continue')} onPress={() => setStep('gender')} style={styles.mainButton} />
        </View>
      </SafeAreaView>
    );
  }

  // Gender step
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.stepTitle}>{t('onboarding.selectGender')}</Text>

        <View style={styles.genderRow}>
          <TouchableOpacity
            style={[styles.genderCard, gender === 'male' && styles.genderCardActive]}
            onPress={() => setGender('male')}
          >
            <MaterialCommunityIcons name="human-male" size={48} color={gender === 'male' ? '#1B7A3D' : '#666666'} />
            <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>
              {t('onboarding.male')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderCard, gender === 'female' && styles.genderCardActive]}
            onPress={() => setGender('female')}
          >
            <MaterialCommunityIcons name="human-female" size={48} color={gender === 'female' ? '#1B7A3D' : '#666666'} />
            <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>
              {t('onboarding.female')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Expected Age */}
        <Text style={styles.expectedAgeLabel}>{t('settings.expectedAge')}: {expectedAge}</Text>
        <Text style={styles.hadithQuote}>{t('onboarding.expectedAgeInfo')}</Text>

        <View style={styles.ageSlider}>
          <TouchableOpacity
            onPress={() => setExpectedAge(Math.max(40, expectedAge - 1))}
            style={styles.ageBtn}
          >
            <MaterialCommunityIcons name="minus" size={24} color="#B0B0B0" />
          </TouchableOpacity>
          <Text style={styles.ageNumber}>{expectedAge}</Text>
          <TouchableOpacity
            onPress={() => setExpectedAge(Math.min(100, expectedAge + 1))}
            style={styles.ageBtn}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#B0B0B0" />
          </TouchableOpacity>
        </View>

        <Button title={t('onboarding.complete')} onPress={handleComplete} style={styles.mainButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0A0A0A' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  topSection: { alignItems: 'center', marginBottom: 40 },
  appName: { color: '#1B7A3D', fontSize: 42, fontWeight: '700', marginTop: 16 },
  tagline: { color: '#B0B0B0', fontSize: 16, marginTop: 8, textAlign: 'center' },
  langSelector: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  langOption: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333333' },
  langOptionActive: { borderColor: '#1B7A3D', backgroundColor: 'rgba(27, 122, 61, 0.15)' },
  langOptionText: { color: '#666666', fontSize: 15, fontWeight: '500' },
  langOptionTextActive: { color: '#1B7A3D' },
  nameInput: { backgroundColor: '#1A1A1A', color: '#FFFFFF', fontSize: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#333333', marginBottom: 24, textAlign: 'center' },
  mainButton: { marginTop: 16 },
  stepTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  stepDescription: { color: '#B0B0B0', fontSize: 15, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  dateInputRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 24 },
  dateField: { alignItems: 'center' },
  dateLabel: { color: '#666666', fontSize: 12, marginBottom: 6 },
  dateInput: { backgroundColor: '#1A1A1A', color: '#FFFFFF', fontSize: 20, fontWeight: '600', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#333333', textAlign: 'center', width: 80 },
  genderRow: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginBottom: 32 },
  genderCard: { width: 130, height: 130, borderRadius: 16, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#333333', alignItems: 'center', justifyContent: 'center', gap: 8 },
  genderCardActive: { borderColor: '#1B7A3D', backgroundColor: 'rgba(27, 122, 61, 0.1)' },
  genderText: { color: '#666666', fontSize: 15, fontWeight: '500' },
  genderTextActive: { color: '#1B7A3D' },
  expectedAgeLabel: { color: '#FFFFFF', fontSize: 16, textAlign: 'center', marginBottom: 8 },
  hadithQuote: { color: '#C9A84C', fontSize: 13, textAlign: 'center', fontStyle: 'italic', marginBottom: 16, lineHeight: 20, paddingHorizontal: 20 },
  ageSlider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 24 },
  ageBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333333' },
  ageNumber: { color: '#C9A84C', fontSize: 36, fontWeight: '700' },
});
