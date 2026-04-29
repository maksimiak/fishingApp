import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';
import type { FishingStatus } from '../data/types';
import { useApp } from '../state/AppState';

interface Props {
  status: FishingStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusChip({ status, size = 'md' }: Props) {
  const { t } = useApp();
  const cfg = {
    open: { bg: theme.successSoft, fg: theme.success, label: t.canFish },
    closed: { bg: theme.dangerSoft, fg: theme.danger, label: t.cannotFish },
    partial: { bg: theme.warningSoft, fg: theme.warning, label: t.partial },
  }[status];

  const sizes = {
    sm: { py: 3, px: 8, fs: 11, dot: 6 },
    md: { py: 5, px: 10, fs: 12, dot: 6 },
    lg: { py: 8, px: 14, fs: 14, dot: 7 },
  }[size];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: cfg.bg,
        paddingVertical: sizes.py,
        paddingHorizontal: sizes.px,
        borderRadius: 999,
        alignSelf: 'flex-start',
      }}
    >
      <View
        style={{
          width: sizes.dot,
          height: sizes.dot,
          borderRadius: 999,
          backgroundColor: cfg.fg,
          marginRight: 6,
        }}
      />
      <Text style={{ color: cfg.fg, fontSize: sizes.fs, fontWeight: '600' }}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
