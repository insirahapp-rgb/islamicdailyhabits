import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const tc = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: tc.surface, borderColor: tc.surfaceBorder }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
});
