import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapScreen } from '../../src/screens/MapScreen';
import { theme } from '../../src/theme/colors';

export default function MapRoute() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <MapScreen />
    </SafeAreaView>
  );
}
