import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FaqScreen } from '../src/screens/FaqScreen';
import { theme } from '../src/theme/colors';

export default function FaqRoute() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <FaqScreen />
    </SafeAreaView>
  );
}
