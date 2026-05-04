import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useApp } from '../../src/state/AppState';
import { theme } from '../../src/theme/colors';
import { IconMap, IconCalendar, IconBook, IconMore } from '../../src/components/Icons';

// Filled icon variants for active state
const IconMapFill = ({ color, size }: { color: string; size: number }) => (
  <View style={styles.iconContainer}>
    <IconMap color={color} size={size} />
    <View style={[styles.activeIndicator, { backgroundColor: color }]} />
  </View>
);

const IconCalendarFill = ({ color, size }: { color: string; size: number }) => (
  <View style={styles.iconContainer}>
    <IconCalendar color={color} size={size} />
    <View style={[styles.activeIndicator, { backgroundColor: color }]} />
  </View>
);

const IconBookFill = ({ color, size }: { color: string; size: number }) => (
  <View style={styles.iconContainer}>
    <IconBook color={color} size={size} />
    <View style={[styles.activeIndicator, { backgroundColor: color }]} />
  </View>
);

const IconMoreFill = ({ color, size }: { color: string; size: number }) => (
  <View style={styles.iconContainer}>
    <IconMore color={color} size={size} />
    <View style={[styles.activeIndicator, { backgroundColor: color }]} />
  </View>
);

export default function TabsLayout() {
  const { t } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidBackground]} />
          )
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.map,
          tabBarIcon: ({ color, focused }) => 
            focused ? <IconMapFill color={color} size={24} /> : <IconMap color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t.calendar,
          tabBarIcon: ({ color, focused }) => 
            focused ? <IconCalendarFill color={color} size={24} /> : <IconCalendar color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: t.tabs.rules,
          tabBarIcon: ({ color, focused }) => 
            focused ? <IconBookFill color={color} size={24} /> : <IconBook color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t.tabs.more,
          tabBarIcon: ({ color, focused }) => 
            focused ? <IconMoreFill color={color} size={24} /> : <IconMore color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 72,
    borderRadius: 36,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.tabBar,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  tabBarItem: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.1,
    marginTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  androidBackground: {
    backgroundColor: theme.tabBar,
    borderRadius: 36,
  },
});
