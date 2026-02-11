import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdBanner } from '../ui/AdBanner';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  showAd?: boolean;
}

export function ScreenContainer({ children, scrollable = true, style, showAd = true }: ScreenContainerProps) {
  const tc = useThemeColors();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: tc.background }]} edges={['top']}>
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, style]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, style]}>{children}</View>
      )}
      {showAd && <AdBanner />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    padding: 16,
  },
});
