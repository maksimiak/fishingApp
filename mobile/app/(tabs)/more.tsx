import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MoreScreen } from '../../src/screens/MoreScreen';
import { theme } from '../../src/theme/colors';

export default function MoreRoute() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <MoreScreen />
    </SafeAreaView>
  );
}
