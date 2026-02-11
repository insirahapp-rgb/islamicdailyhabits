import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import '../src/i18n';
import { useThemeColors } from '../src/hooks/useThemeColors';

export default function RootLayout() {
  const tc = useThemeColors();
  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: tc.background }]}>
      <StatusBar style={tc.statusBarStyle} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: tc.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="verse/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
