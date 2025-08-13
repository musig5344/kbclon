/**
 * KB Modal 래퍼
 * 기존 KBModal 인터페이스를 유지하면서 통합 컴포넌트 사용
 */

import React from 'react';

import { Modal, ModalProps } from '../../shared/components/ui/Modal';

interface KBModalProps extends Omit<ModalProps, 'variant'> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  footerActions?: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const KBModal: React.FC<KBModalProps> = props => {
  return <Modal {...props} variant='kb' />;
};

export default KBModal;
