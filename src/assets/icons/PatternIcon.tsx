import React from 'react';
interface PatternIconProps {
  size?: number;
  color?: string;
  className?: string;
}
export const PatternIcon: React.FC<PatternIconProps> = ({ size = 64, color = '#333333', className }) => {
  const dotRadius = 4;
  const gap = (size - dotRadius * 2 * 3) / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      <circle cx={dotRadius} cy={dotRadius} r={dotRadius} fill={color} />
      <circle cx={dotRadius + gap + dotRadius * 2} cy={dotRadius} r={dotRadius} fill={color} />
      <circle cx={dotRadius + gap * 2 + dotRadius * 4} cy={dotRadius} r={dotRadius} fill={color} />
      <circle cx={dotRadius} cy={dotRadius + gap + dotRadius * 2} r={dotRadius} fill={color} />
      <circle cx={dotRadius + gap + dotRadius * 2} cy={dotRadius + gap + dotRadius * 2} r={dotRadius} fill={color} />
      <circle cx={dotRadius + gap * 2 + dotRadius * 4} cy={dotRadius + gap + dotRadius * 2} r={dotRadius} fill={color} />
      <circle cx={dotRadius} cy={dotRadius + gap * 2 + dotRadius * 4} r={dotRadius} fill={color} />
      <circle cx={dotRadius + gap + dotRadius * 2} cy={dotRadius + gap * 2 + dotRadius * 4} r={dotRadius} fill={color} />
      <circle cx={dotRadius + gap * 2 + dotRadius * 4} cy={dotRadius + gap * 2 + dotRadius * 4} r={dotRadius} fill={color} />
    </svg>
  );
}; 