import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useThemeColors } from '../../src/hooks/useThemeColors';

export default function TabLayout() {
  const { t } = useTranslation();
  const tc = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tc.tabBarBg,
          borderTopColor: tc.tabBarBorder,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 30,
          paddingTop: 8,
        },
        tabBarActiveTintColor: tc.primary,
        tabBarInactiveTintColor: tc.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.life'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="timer-sand" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: t('tabs.tracker'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clock-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wisdom"
        options={{
          title: t('tabs.wisdom'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-variant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
