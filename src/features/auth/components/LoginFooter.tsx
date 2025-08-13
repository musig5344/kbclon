import React from 'react';

import { ArrowRight } from '../../../assets/icons/ArrowRight';
import SimplePayIcon from '../../../assets/images/icons/icon_simple_pay.png';
import { colors } from '../../../styles/colors';

import {
  Footer,
  OtherLoginButton,
  SimplePayButton,
  SimplePayIconImg,
  ArrowIconStyled,
} from './LoginScreen.styles';

interface LoginFooterProps {
  onSimplePay: () => void;
}

export const LoginFooter: React.FC<LoginFooterProps> = ({ onSimplePay }) => {
  return (
    <Footer>
      <SimplePayButton
        onClick={onSimplePay}
        aria-label='간편송금 및 결제 서비스 이용'
        type='button'
      >
        <SimplePayIconImg src={SimplePayIcon} alt='' aria-hidden='true' />
        <span>간편송금·결제</span>
      </SimplePayButton>
    </Footer>
  );
};
