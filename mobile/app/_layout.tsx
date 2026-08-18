import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider } from '../src/state/AppState';
import { theme } from '../src/theme/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="waterbody/[id]" />
          <Stack.Screen name="species/[id]" />
          <Stack.Screen name="about" />
          <Stack.Screen name="faq" />
        </Stack>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
