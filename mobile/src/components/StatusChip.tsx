import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';
import type { FishingStatus } from '../data/types';
import { useApp } from '../state/AppState';
import { IconCheck, IconX } from './Icons';

interface Props {
  status: FishingStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StatusChip({ status, size = 'md', showIcon = true }: Props) {
  const { t } = useApp();
  
  const cfg = {
    open: { 
      bg: theme.successSoft, 
      fg: theme.success, 
      label: t.canFish,
      icon: 'check' as const,
    },
    closed: { 
      bg: theme.dangerSoft, 
      fg: theme.danger, 
      label: t.cannotFish,
      icon: 'x' as const,
    },
    partial: { 
      bg: theme.warningSoft, 
      fg: theme.warning, 
      label: t.partial,
      icon: 'dot' as const,
    },
  }[status];

  const sizes = {
    sm: { py: 4, px: 10, fs: 11, iconSize: 10, gap: 5 },
    md: { py: 6, px: 12, fs: 12, iconSize: 12, gap: 6 },
    lg: { py: 10, px: 16, fs: 14, iconSize: 14, gap: 8 },
  }[size];

  const renderIcon = () => {
    if (!showIcon) return null;
    
    if (cfg.icon === 'check') {
      return <IconCheck color={cfg.fg} size={sizes.iconSize} />;
    }
    if (cfg.icon === 'x') {
      return <IconX color={cfg.fg} size={sizes.iconSize} />;
    }
    // Dot for partial
    return (
      <View
        style={{
          width: sizes.iconSize - 4,
          height: sizes.iconSize - 4,
          borderRadius: 999,
          backgroundColor: cfg.fg,
        }}
      />
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: cfg.bg,
          paddingVertical: sizes.py,
          paddingHorizontal: sizes.px,
          gap: sizes.gap,
        },
      ]}
    >
      {renderIcon()}
      <Text 
        style={[
          styles.label, 
          { 
            color: cfg.fg, 
            fontSize: sizes.fs,
          }
        ]}
      >
        {cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});
