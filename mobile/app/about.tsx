import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AboutScreen } from '../src/screens/AboutScreen';
import { theme } from '../src/theme/colors';

export default function AboutRoute() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <AboutScreen />
    </SafeAreaView>
  );
}
