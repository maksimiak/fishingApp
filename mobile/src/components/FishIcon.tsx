import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { Species } from '../data/types';

export function FishIcon({ species, size = 40 }: { species: Species; size?: number }) {
  const color = species.color;
  const shape = species.shape;
  let path: string;
  if (shape === 'long') {
    path = 'M 5 12 Q 15 6, 45 6 Q 70 6, 82 10 L 92 4 L 92 20 L 82 14 Q 70 18, 45 18 Q 15 18, 5 12 Z';
  } else if (shape === 'round') {
    path = 'M 10 12 Q 20 3, 45 3 Q 68 3, 80 10 L 92 3 L 92 21 L 80 14 Q 68 21, 45 21 Q 20 21, 10 12 Z';
  } else {
    path = 'M 8 12 Q 18 5, 45 5 Q 68 5, 80 10 L 92 4 L 92 20 L 80 14 Q 68 19, 45 19 Q 18 19, 8 12 Z';
  }
  const w = size * 1.8;
  const h = size * 0.75;
  return (
    <Svg width={w} height={h} viewBox="0 0 100 24">
      <Path d={path} fill={color} opacity={0.92} />
      <Circle cx={shape === 'long' ? 78 : 72} cy="10" r="1.3" fill="white" />
      <Path d="M 45 4 L 52 0 L 55 5 Z" fill={color} opacity={0.7} />
      <Path d="M 45 20 L 52 24 L 55 19 Z" fill={color} opacity={0.7} />
    </Svg>
  );
}
