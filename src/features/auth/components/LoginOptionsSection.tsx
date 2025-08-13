import React from 'react';

import { PatternIcon } from '../../../assets/icons/PatternIcon';
import fingerprintIcon from '../../../assets/images/icons/icon_login_finger.png';

import {
  LoginOptionsContainer,
  LoginOptionButton,
  IconImage,
  IconContainer,
  Divider,
  LoginOptionText,
} from './LoginScreen.styles';

interface LoginOptionsSectionProps {
  onBiometricAuth: (type: 'fingerprint' | 'pattern') => void;
}

export const LoginOptionsSection: React.FC<LoginOptionsSectionProps> = ({ onBiometricAuth }) => {
  return (
    <LoginOptionsContainer role='group' aria-label='생체 인증 방법 선택'>
      <LoginOptionButton
        onClick={() => onBiometricAuth('fingerprint')}
        aria-label='지문 인증으로 로그인'
        aria-describedby='fingerprint-desc'
        type='button'
      >
        <IconContainer role='img' aria-hidden='true'>
          <IconImage src={fingerprintIcon} alt='' aria-hidden='true' />
        </IconContainer>
        <LoginOptionText>지문</LoginOptionText>
        <span id='fingerprint-desc' className='sr-only'>
          지문을 사용하여 빠르고 안전하게 로그인할 수 있습니다
        </span>
      </LoginOptionButton>
      <Divider role='separator' aria-hidden='true' />
      <LoginOptionButton
        onClick={() => onBiometricAuth('pattern')}
        aria-label='패턴 인증으로 로그인'
        aria-describedby='pattern-desc'
        type='button'
      >
        <IconContainer role='img' aria-hidden='true'>
          <PatternIcon size={48} color='#1A1A1A' aria-hidden='true' />
        </IconContainer>
        <LoginOptionText>패턴</LoginOptionText>
        <span id='pattern-desc' className='sr-only'>
          패턴을 그려서 빠르고 안전하게 로그인할 수 있습니다
        </span>
      </LoginOptionButton>
    </LoginOptionsContainer>
  );
};
