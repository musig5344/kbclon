/**
 * KB 네이티브 BottomSheet 래퍼
 * 기존 KBBottomSheet 인터페이스를 유지하면서 통합 컴포넌트 사용
 */

import React from 'react';

import BottomSheet, { BottomSheetProps } from '../../shared/components/ui/BottomSheet';

interface KBBottomSheetProps
  extends Omit<BottomSheetProps, 'variant' | 'usePortal' | 'showSlideBar'> {
  showHandle?: boolean;
  closeOnBackdrop?: boolean;
  closeOnSwipeDown?: boolean;
}

export const KBBottomSheet: React.FC<KBBottomSheetProps> = ({
  showHandle = true,
  closeOnBackdrop = true,
  closeOnSwipeDown = true,
  ...props
}) => {
  return (
    <BottomSheet
      {...props}
      variant='native'
      usePortal={true}
      showHandle={showHandle}
      closeOnBackdrop={closeOnBackdrop}
      closeOnSwipeDown={closeOnSwipeDown}
    />
  );
};

export default KBBottomSheet;
