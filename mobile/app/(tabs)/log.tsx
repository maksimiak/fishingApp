import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RulesScreen } from '../../src/screens/RulesScreen';
import { theme } from '../../src/theme/colors';

export default function RulesRoute() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <RulesScreen />
    </SafeAreaView>
  );
}
