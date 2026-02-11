import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Linking, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export function AdBanner() {
  const { t } = useTranslation();

  const handlePress = () => {
    Linking.openURL('https://wa.me/905336853517');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="bullhorn-outline" size={18} color="#C9A84C" />
        <Text style={styles.text}>{t('ad.sponsorText')}</Text>
        <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#333333',
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
    color: '#C9A84C',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
});
