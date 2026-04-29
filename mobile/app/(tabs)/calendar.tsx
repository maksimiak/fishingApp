import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarScreen } from '../../src/screens/CalendarScreen';
import { theme } from '../../src/theme/colors';

export default function CalendarRoute() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <CalendarScreen />
    </SafeAreaView>
  );
}
