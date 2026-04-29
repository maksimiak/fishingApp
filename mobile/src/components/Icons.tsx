import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

type IconProps = { color?: string; size?: number };

const base = (size = 20) => ({ width: size, height: size, viewBox: '0 0 24 24' });

export const IconMap = ({ color = '#000', size = 20 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2Z" />
    <Path d="M9 3v16M15 5v16" />
  </Svg>
);

export const IconBookmark = ({ color = '#000', size = 20 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </Svg>
);

export const IconBookmarkFill = ({ color = '#000', size = 20 }: IconProps) => (
  <Svg {...base(size)} fill={color} stroke={color} strokeWidth={1.5} strokeLinejoin="round">
    <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </Svg>
);

export const IconBook = ({ color = '#000', size = 20 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 4h16v16H4z" />
    <Path d="M4 8h16M8 4v16" />
  </Svg>
);

export const IconMore = ({ color = '#000', size = 20 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
    <Circle cx={5} cy={12} r={1} />
    <Circle cx={12} cy={12} r={1} />
    <Circle cx={19} cy={12} r={1} />
  </Svg>
);

export const IconSearch = ({ color = '#000', size = 18 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round">
    <Circle cx={11} cy={11} r={7} />
    <Path d="M20 20l-3.5-3.5" />
  </Svg>
);

export const IconCheck = ({ color = '#000', size = 18 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 12l5 5L20 6" />
  </Svg>
);

export const IconX = ({ color = '#000', size = 16 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round">
    <Path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const IconChevron = ({ color = '#000', size = 14 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 6l6 6-6 6" />
  </Svg>
);

export const IconBack = ({ color = '#000', size = 20 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 18l-6-6 6-6" />
  </Svg>
);

export const IconPlus = ({ color = '#000', size = 20 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconShare = ({ color = '#000', size = 18 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14" />
  </Svg>
);

export const IconRuler = ({ color = '#000', size = 18 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 8l5-5 13 13-5 5z" />
    <Path d="M7 7l2 2M10 4l3 3M13 10l2 2M16 7l3 3" />
  </Svg>
);

export const IconWeight = ({ color = '#000', size = 18 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 9h16l-2 11H6z" />
    <Circle cx={12} cy={6} r={2} />
  </Svg>
);

export const IconThermo = ({ color = '#000', size = 18 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M10 14V4a2 2 0 0 1 4 0v10a4 4 0 1 1-4 0z" />
  </Svg>
);

export const IconWind = ({ color = '#000', size = 18 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 8h12a3 3 0 1 0-3-3M3 12h17M3 16h11a3 3 0 1 1-3 3" />
  </Svg>
);

export const IconCalendar = ({ color = '#000', size = 18 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Rect x={3} y={5} width={18} height={16} rx={2} />
    <Path d="M3 10h18M8 3v4M16 3v4" />
  </Svg>
);

export const IconLocation = ({ color = '#000', size = 18 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 11a8 8 0 1 1-16 0c0-4.4 3.6-8 8-8s8 3.6 8 8z" />
    <Circle cx={12} cy={11} r={3} />
  </Svg>
);

export const IconLayers = ({ color = '#000', size = 18 }: IconProps) => (
  <Svg {...base(size)} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 3 2 8l10 5 10-5z" />
    <Path d="M2 13l10 5 10-5M2 18l10 5 10-5" />
  </Svg>
);
