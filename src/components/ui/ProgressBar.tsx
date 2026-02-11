import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color = '#1B7A3D', height = 8 }: ProgressBarProps) {
  const tc = useThemeColors();
  return (
    <View style={[styles.track, { height, backgroundColor: tc.chartEmpty }]}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 4,
  },
});
