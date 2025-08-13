import React from 'react';
interface ArrowRightProps {
  size?: number;
  color?: string;
  className?: string;
}
export const ArrowRight: React.FC<ArrowRightProps> = ({ 
  size = 20, 
  color = '#484B51', 
  className 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.5 15.5l5.417-5.417L7.5 4.667"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}; 