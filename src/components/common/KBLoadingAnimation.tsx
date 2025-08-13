import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const frames = Array.from({ length: 17 }, (_, i) => 
  `/assets/images/loading/loading_1_${String(i + 1).padStart(2, '0')}.png`
);

const AnimationContainer = styled.div`
  width: 64px;
  height: 64px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

export const KBLoadingAnimation: React.FC = () => {
  const [currentFrame, setCurrentFrame] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 58.8); // 17프레임 / 1초 = 58.8ms per frame
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <AnimationContainer
      style={{ backgroundImage: `url(${frames[currentFrame]})` }}
    />
  );
};