import React, { useState } from 'react';

import styled from 'styled-components';

import BottomSheet from '../../shared/components/ui/BottomSheet';
import { dimensions } from '../../styles/dimensions';
import { tokens } from '../../styles/tokens';
// import { colors } from '../../styles/colors'; // 사용되지 않음
import { typography } from '../../styles/typography';
interface LoginBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}
// KB스타뱅킹 로그인 탭 스타일 (완전 분석된 디자인)
const TabContainer = styled.div`
  padding: ${dimensions.spacing.loginTabTop}px ${dimensions.spacing.loginTabHorizontal}px 0;
`;
const TabBackground = styled.div`
  background-color: ${tokens.colors.backgroundGray2}; // RGB_ebeef0
  border-radius: ${dimensions.borderRadius.loginTab}px;
  padding: 4px;
  display: flex;
  height: ${dimensions.height.loginTab + 8}px; // 탭 높이 + 패딩
`;
const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  height: ${dimensions.height.loginTab}px;
  border: none;
  border-radius: ${dimensions.borderRadius.loginTab}px;
  font-size: ${typography.styles.loginTab.fontSize.replace('dp', 'px')};
  font-family: ${typography.fontFamily.kbfgTextBold};
  font-weight: 700;
  letter-spacing: ${typography.letterSpacing.tight};
  cursor: pointer;
  transition: all 0.2s ease;
  ${props =>
    props.$active
      ? `
    background-color: ${tokens.colors.background.primary};
    color: ${tokens.colors.text.primary};
    border: 1px solid ${tokens.colors.border.light};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  `
      : `
    background-color: transparent;
    color: ${tokens.colors.text.tertiary};
  `}
`;
const TabContent = styled.div`
  padding: 32px 24px;
  min-height: 400px;
`;
const SimpleSendSection = styled.div`
  margin-bottom: 32px;
`;
const SimpleSendButton = styled.button`
  width: 100%;
  height: 48px; /* 간편송금 버튼 높이 */
  background-color: ${tokens.colors.backgroundGray1};
  border: 1px solid ${tokens.colors.border.primary};
  border-radius: ${dimensions.borderRadius.small}px;
  font-size: 15px;
  font-family: ${typography.fontFamily.kbfgTextLight};
  color: ${tokens.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${tokens.colors.backgroundGray2};
  }
`;
const AuthOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;
const AuthOptionButton = styled.button`
  height: 60px;
  background-color: ${tokens.colors.background.primary};
  border: 1px solid ${tokens.colors.border.light};
  border-radius: ${dimensions.borderRadius.medium}px;
  font-size: 14px;
  font-family: ${typography.fontFamily.kbfgTextLight};
  color: ${tokens.colors.text.primary};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${tokens.colors.backgroundGray1};
    border-color: ${tokens.colors.brand.primary};
  }
`;
const AuthIcon = styled.div`
  width: 24px;
  height: 24px;
  background-color: ${tokens.colors.text.tertiary};
  border-radius: 50%;
  margin-bottom: 4px;
`;
const NoCertSection = styled.div`
  text-align: center;
  padding: 16px 0;
`;
const NoCertButton = styled.button`
  background-color: ${tokens.colors.brand.primary};
  border: none;
  border-radius: ${dimensions.borderRadius.small}px;
  padding: 12px 24px;
  font-size: 14px;
  font-family: ${typography.fontFamily.kbfgTextBold};
  color: ${tokens.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${tokens.colors.brand.dark};
  }
`;
const OtherLoginSection = styled.div`
  border-top: 1px solid ${tokens.colors.backgroundGray2};
  padding-top: 24px;
  margin-top: 24px;
`;
const OtherLoginTitle = styled.h3`
  font-size: 16px;
  font-family: ${typography.fontFamily.kbfgTextBold};
  color: ${tokens.colors.text.primary};
  margin: 0 0 16px 0;
  text-align: center;
`;
const OtherLoginGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;
const OtherLoginButton = styled.button`
  height: 72px;
  background-color: ${tokens.colors.background.primary};
  border: 1px solid ${tokens.colors.border.light};
  border-radius: ${dimensions.borderRadius.medium}px;
  font-size: 12px;
  font-family: ${typography.fontFamily.kbfgTextLight};
  color: ${tokens.colors.text.primary};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${tokens.colors.backgroundGray1};
    border-color: ${tokens.colors.brand.primary};
  }
`;
const LoginBottomSheet: React.FC<LoginBottomSheetProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'simple' | 'cert'>('simple');
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} height='70vh' showSlideBar={true}>
      <TabContainer>
        <TabBackground>
          <TabButton $active={activeTab === 'simple'} onClick={() => setActiveTab('simple')}>
            간편로그인
          </TabButton>
          <TabButton $active={activeTab === 'cert'} onClick={() => setActiveTab('cert')}>
            인증서로그인
          </TabButton>
        </TabBackground>
      </TabContainer>
      <TabContent>
        {activeTab === 'simple' ? (
          <>
            <SimpleSendSection>
              <SimpleSendButton>간편송금</SimpleSendButton>
            </SimpleSendSection>
            <AuthOptionsGrid>
              <AuthOptionButton>
                <AuthIcon />
                패턴
              </AuthOptionButton>
              <AuthOptionButton>
                <AuthIcon />
                지문
              </AuthOptionButton>
              <AuthOptionButton>
                <AuthIcon />
                얼굴
              </AuthOptionButton>
              <AuthOptionButton>
                <AuthIcon />
                KB Sign
              </AuthOptionButton>
            </AuthOptionsGrid>
            <NoCertSection>
              <NoCertButton>인증서 없음 →</NoCertButton>
            </NoCertSection>
          </>
        ) : (
          <>
            <AuthOptionsGrid>
              <AuthOptionButton>
                <AuthIcon />
                공동인증서
              </AuthOptionButton>
              <AuthOptionButton>
                <AuthIcon />
                금융인증서
              </AuthOptionButton>
            </AuthOptionsGrid>
            <NoCertSection>
              <NoCertButton>인증서 없음 →</NoCertButton>
            </NoCertSection>
          </>
        )}
        <OtherLoginSection>
          <OtherLoginTitle>기타 로그인</OtherLoginTitle>
          <OtherLoginGrid>
            <OtherLoginButton>
              <AuthIcon />
              아이디
            </OtherLoginButton>
            <OtherLoginButton>
              <AuthIcon />
              스타틴즈
            </OtherLoginButton>
            <OtherLoginButton>
              <AuthIcon />
              Look
            </OtherLoginButton>
          </OtherLoginGrid>
        </OtherLoginSection>
      </TabContent>
    </BottomSheet>
  );
};
export default LoginBottomSheet;
