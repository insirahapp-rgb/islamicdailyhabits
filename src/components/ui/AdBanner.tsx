import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Linking, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../hooks/useThemeColors';

export function AdBanner() {
  const { t } = useTranslation();
  const tc = useThemeColors();

  const handlePress = () => {
    Linking.openURL('https://wa.me/905336853517');
  };

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: tc.surface, borderTopColor: tc.surfaceBorder }]} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="bullhorn-outline" size={18} color={tc.accent} />
        <Text style={[styles.text, { color: tc.accent }]}>{t('ad.sponsorText')}</Text>
        <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
});
