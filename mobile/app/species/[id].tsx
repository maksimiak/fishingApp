import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SpeciesScreen } from '../../src/screens/SpeciesScreen';
import { theme } from '../../src/theme/colors';

export default function SpeciesRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <SpeciesScreen id={id} />
    </SafeAreaView>
  );
}
