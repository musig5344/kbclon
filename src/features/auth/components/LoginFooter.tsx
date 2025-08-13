import React from 'react';

import { ArrowRight } from '../../../assets/icons/ArrowRight';
import SimplePayIcon from '../../../assets/images/icons/icon_simple_pay.png';
import { colors } from '../../../styles/colors';

import {
  Footer,
  OtherLoginButton,
  SimplePayButton,
  SimplePayIconImg,
  ArrowIconStyled
} from './LoginScreen.styles';

interface LoginFooterProps {
  onOtherLoginClick: () => void;
  onSimplePay: () => void;
}

export const LoginFooter: React.FC<LoginFooterProps> = ({
  onOtherLoginClick,
  onSimplePay
}) => {
  return (
    <Footer>
      <OtherLoginButton 
        onClick={onOtherLoginClick}
        aria-label="다른 로그인 방법 선택 메뉴 열기"
        aria-expanded="false"
        aria-haspopup="true"
        type="button"
      >
        <span>다른 로그인 방법 선택</span>
        <ArrowIconStyled aria-hidden="true">
          <ArrowRight size={18} color={colors.textSecondary} aria-hidden="true" />
        </ArrowIconStyled>
      </OtherLoginButton>
      <SimplePayButton 
        onClick={onSimplePay}
        aria-label="간편송금 및 결제 서비스 이용"
        type="button"
      >
        <SimplePayIconImg 
          src={SimplePayIcon} 
          alt="" 
          aria-hidden="true"
        />
        <span>간편송금·결제</span>
      </SimplePayButton>
    </Footer>
  );
};