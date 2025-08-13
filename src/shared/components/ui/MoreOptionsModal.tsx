import React from 'react';

import styled from 'styled-components';

import { tokens } from '../../../styles/tokens';
const ModalOverlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: flex-end;
  z-index: 1000;
`;
const ModalContent = styled.div<{ show: boolean }>`
  width: 100%;
  background: ${tokens.colors.white};
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  transform: translateY(${props => props.show ? '0' : '100%'});
  transition: transform 0.3s ease;
  padding: 24px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
`;
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${tokens.colors.border.primary};
`;
const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: ${tokens.colors.text.primary};
`;
const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${tokens.colors.text.secondary};
  padding: 4px;
`;
const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
const OptionItem = styled.button`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
`;
const OptionIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: ${tokens.colors.text.secondary};
`;
const OptionText = styled.span`
  font-size: 16px;
  color: ${tokens.colors.text.primary};
  font-weight: 500;
`;
interface MoreOptionsModalProps {
  show: boolean;
  onClose: () => void;
  options?: Array<{
    icon: string;
    text: string;
    onClick: () => void;
  }>;
}
const defaultOptions = [
  {
    icon: '🔔',
    text: '입출금 알림 등록',
  },
  {
    icon: '🏧',
    text: '자동이체 관리',
  },
  {
    icon: '💳',
    text: '금리확인',
  },
  {
    icon: '📋',
    text: '계좌별명 변경',
  },
  {
    icon: '📊',
    text: '통장사본 보기',
  },
  {
    icon: '📱',
    text: 'QR코드 만들기',
  },
  {
    icon: '🔒',
    text: '계좌숨기기',
  }
];
export const MoreOptionsModal: React.FC<MoreOptionsModalProps> = ({ 
  show, 
  onClose, 
  options = defaultOptions 
}) => {
  return (
    <ModalOverlay show={show} onClick={onClose}>
      <ModalContent show={show} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>더보기 메뉴</ModalTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>
        <OptionsList>
          {options.map((option, index) => (
            <OptionItem 
              key={index} 
              onClick={() => {
                option.onClick();
                onClose();
              }}
            >
              <OptionIcon>{option.icon}</OptionIcon>
              <OptionText>{option.text}</OptionText>
            </OptionItem>
          ))}
        </OptionsList>
      </ModalContent>
    </ModalOverlay>
  );
};