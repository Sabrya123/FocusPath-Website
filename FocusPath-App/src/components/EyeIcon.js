import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export function EyeOpen({ size = 24, color = '#e2e2e2' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="12"
        cy="12"
        r="3.5"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function EyeClosed({ size = 24, color = '#e2e2e2' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="3 3"
        opacity={0.4}
      />
      <Path
        d="M4 4L20 20"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
