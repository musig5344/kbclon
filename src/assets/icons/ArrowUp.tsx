import React from 'react';
interface ArrowUpProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}
export const ArrowUp: React.FC<ArrowUpProps> = ({ 
  size = 20, 
  color = '#484B51', 
  className,
  style
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.832 12.5L9.999 6.667 4.165 12.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}; 