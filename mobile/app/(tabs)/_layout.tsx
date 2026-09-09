import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../src/state/AppState';
import { theme, fonts } from '../../src/theme/colors';
import { IconMap, IconCalendar, IconBook, IconMore } from '../../src/components/Icons';

export default function TabsLayout() {
  const { t } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.outline,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.cardBorder,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingTop: 6,
          paddingBottom: 8 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          fontFamily: fonts.sansSemiBold,
          letterSpacing: -0.1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.map,
          tabBarIcon: ({ color }) => <IconMap color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t.calendar,
          tabBarIcon: ({ color }) => <IconCalendar color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="rules"
        options={{
          title: t.tabs.rules,
          tabBarIcon: ({ color }) => <IconBook color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t.tabs.more,
          tabBarIcon: ({ color }) => <IconMore color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}
