import React, { useState, useEffect } from 'react';

import styled, { keyframes } from 'styled-components';

// 로딩 이미지들을 정적으로 import
import loading1_01 from '../../../assets/images/loading/loading_1_01.png';
import loading1_02 from '../../../assets/images/loading/loading_1_02.png';
import loading1_03 from '../../../assets/images/loading/loading_1_03.png';
import loading1_04 from '../../../assets/images/loading/loading_1_04.png';
import loading2_01 from '../../../assets/images/loading/loading_2_01.png';
import loading2_02 from '../../../assets/images/loading/loading_2_02.png';
import loading2_03 from '../../../assets/images/loading/loading_2_03.png';
import loading2_04 from '../../../assets/images/loading/loading_2_04.png';
// 로딩 이미지 배열들
const imagePaths_1 = [loading1_01, loading1_02, loading1_03, loading1_04];
const imagePaths_2 = [loading2_01, loading2_02, loading2_03, loading2_04];
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const LoaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease;
`;
const AnimationImage = styled.img`
  width: 120px;
  height: auto;
`;
export const PageLoader: React.FC = () => {
  const [frame1, setFrame1] = useState(0);
  const [frame2, setFrame2] = useState(0);
  useEffect(() => {
    const interval1 = setInterval(() => {
      setFrame1(prevFrame => (prevFrame + 1) % imagePaths_1.length);
    }, 100); // 0.1초마다 점 애니메이션 프레임 변경
    const interval2 = setInterval(() => {
      setFrame2(prevFrame => (prevFrame + 1) % imagePaths_2.length);
    }, 150); // 0.15초마다 곰 애니메이션 프레임 변경
    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, []);
  return (
    <LoaderContainer>
      <AnimationImage src={imagePaths_2[frame2]} alt='로딩 중...' />
      <AnimationImage
        src={imagePaths_1[frame1]}
        style={{ width: '80px', marginTop: '-20px' }}
        alt=''
      />
    </LoaderContainer>
  );
};
