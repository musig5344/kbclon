import React from 'react';

import styled, { keyframes } from 'styled-components';

import { PatternIcon } from '../../../../assets/icons/PatternIcon';
import FingerprintIcon from '../../../../assets/images/ic_fingerprint.png';
import { tokens } from '../../../../styles/tokens';
// fragment_kbsign_login_with_tab.xml 기반 스타일
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between; /* 요소들을 수직으로 분산 */
  height: 100%;
  padding: 32px 24px;
`;
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;
const Title = styled.h3`
  font-family: 'KBFGText', sans-serif;
  font-size: 18px; // dimens: fragment_kbsign_login_title_text_view_text_size
  font-weight: 700;
  color: ${tokens.colors.text.primary};
  line-height: 1.4; // lineSpacingExtra="4.0dip"
  letter-spacing: -0.02em;
  text-align: center;
  margin-bottom: 32px; // space2 height (추정)
`;
const LoginOptionsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px; // 16dp margin * 2
  margin-bottom: 24px; // dimens: fragment_no_cert_button_margin_top
`;
const LoginOptionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  &:hover {
    opacity: 0.8;
  }
`;
/*
const IconPlaceholder = styled.div`
  width: 64px; // fragment_no_cert_img_size
  height: 64px; // fragment_no_cert_img_size
  background-color: ${tokens.colors.lightGray};
  border-radius: 50%;
  // TODO: imageorigin 폴더에서 실제 아이콘으로 교체
`;
*/
const IconImage = styled.img`
  width: 64px; // dimens: fragment_no_cert_img_size
  height: 64px; // dimens: fragment_no_cert_img_size
`;
const OptionText = styled.span`
  font-family: 'KBFGText', sans-serif;
  font-size: 14px;
  color: ${tokens.colors.text.secondary};
`;
const Divider = styled.div`
  width: 1px;
  height: 48px; // dimens: fragment_no_cert_img_middle_height
  background-color: ${tokens.colors.border.primary};
`;
const ripple = keyframes`
  to {
    transform: scale(4);
    opacity: 0;
  }
`;
export const ActionButton = styled.button`
  width: 160px; // dimens: fragment_no_cert_button_width
  height: 48px; // dimens: fragment_no_cert_button_height
  background-color: ${tokens.colors.lightGray};
  border: none;
  border-radius: 8px;
  font-family: 'KBFGText', sans-serif;
  font-size: 16px; // dimens: fragment_no_cert_button_text_size
  font-weight: 700;
  color: ${tokens.colors.text.primary};
  cursor: pointer;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  transition: background-color 0.2s;
  &:hover {
    background-color: ${tokens.colors.border.primary};
  }
  .ripple {
    position: absolute;
    border-radius: 50%;
    transform: scale(0);
    animation: ${ripple} 600ms linear;
    background-color: rgba(0, 0, 0, 0.1);
  }
`;
const BottomLinks = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;
export const LinkText = styled.a`
  font-family: 'KBFGText', sans-serif;
  font-size: 14px;
  color: ${tokens.colors.text.tertiary};
  text-decoration: underline;
  cursor: pointer;
  &:hover {
    color: ${tokens.colors.text.primary};
  }
`;
export const KBSignLoginTab: React.FC = () => {
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");
    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) {
      ripple.remove();
    }
    button.appendChild(circle);
  };
  return (
    <Container>
      <ContentWrapper>
        <Title>
          지문 또는 패턴으로<br />
          빠르고 안전하게 로그인하세요.
        </Title>
        <LoginOptionsContainer>
          <LoginOptionButton>
            <IconImage src={FingerprintIcon} alt="지문인증 아이콘" />
            <OptionText>지문인증</OptionText>
          </LoginOptionButton>
          <Divider />
          <LoginOptionButton>
            <PatternIcon size={64} />
            <OptionText>패턴</OptionText>
          </LoginOptionButton>
        </LoginOptionsContainer>
        <ActionButton onClick={createRipple}>
          인증수단 등록
        </ActionButton>
      </ContentWrapper>
      <BottomLinks>
        <LinkText>다른 로그인 방법</LinkText>
      </BottomLinks>
    </Container>
  );
}; 