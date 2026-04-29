import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SavedScreen } from '../../src/screens/SavedScreen';
import { theme } from '../../src/theme/colors';

export default function SavedRoute() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <SavedScreen />
    </SafeAreaView>
  );
}
