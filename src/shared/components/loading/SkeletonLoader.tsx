/**
 * KB 스타뱅킹 스켈레톤 로딩 컴포넌트
 * 콘텐츠 로딩 중 자연스러운 플레이스홀더 표시
 */

import React from 'react';

import styled from 'styled-components';

import { kbSkeletonStyle, kbSkeletonPulse } from '../../../styles/KBMicroDetails';

// 기본 스켈레톤 요소
const SkeletonBase = styled.div`
  ${kbSkeletonStyle}
  border-radius: 4px;
`;

// 텍스트 스켈레톤
export const SkeletonText = styled(SkeletonBase)<{
  width?: string;
  height?: string;
  marginBottom?: string;
}>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '16px'};
  margin-bottom: ${props => props.marginBottom || '0'};
`;

// 원형 스켈레톤 (프로필 이미지 등)
export const SkeletonCircle = styled(SkeletonBase)<{ size?: number }>`
  width: ${props => props.size || 40}px;
  height: ${props => props.size || 40}px;
  border-radius: 50%;
`;

// 사각형 스켈레톤 (이미지, 카드 등)
export const SkeletonRect = styled(SkeletonBase)<{
  width?: string;
  height?: string;
  radius?: string;
}>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '100px'};
  border-radius: ${props => props.radius || '8px'};
`;

// 계좌 카드 스켈레톤
const AccountCardSkeleton = styled.div`
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 12px;
`;

const AccountHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const AccountContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

export const KBAccountSkeleton: React.FC = () => (
  <AccountCardSkeleton>
    <AccountHeader>
      <SkeletonCircle size={40} />
      <div style={{ marginLeft: '12px', flex: 1 }}>
        <SkeletonText width='120px' height='14px' marginBottom='4px' />
        <SkeletonText width='160px' height='12px' />
      </div>
    </AccountHeader>
    <AccountContent>
      <SkeletonText width='80px' height='24px' />
      <SkeletonText width='120px' height='20px' />
    </AccountContent>
  </AccountCardSkeleton>
);

// 거래내역 아이템 스켈레톤
const TransactionItemSkeleton = styled.div`
  display: flex;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
`;

const TransactionInfo = styled.div`
  flex: 1;
`;

export const KBTransactionSkeleton: React.FC = () => (
  <TransactionItemSkeleton>
    <TransactionInfo>
      <SkeletonText width='140px' height='16px' marginBottom='4px' />
      <SkeletonText width='80px' height='14px' />
    </TransactionInfo>
    <div style={{ textAlign: 'right' }}>
      <SkeletonText width='80px' height='16px' marginBottom='4px' />
      <SkeletonText width='100px' height='14px' />
    </div>
  </TransactionItemSkeleton>
);

// 메뉴 아이템 스켈레톤
const MenuItemSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  width: 25%;
`;

export const KBMenuItemSkeleton: React.FC = () => (
  <MenuItemSkeleton>
    <SkeletonCircle size={48} />
    <SkeletonText width='50px' height='12px' marginBottom='0' style={{ marginTop: '8px' }} />
  </MenuItemSkeleton>
);

// 대시보드 배너 스켈레톤
export const KBBannerSkeleton: React.FC = () => (
  <SkeletonRect width='100%' height='180px' radius='0' />
);

// 전체 페이지 스켈레톤 레이아웃
const PageSkeletonContainer = styled.div`
  padding: 20px;
`;

export const KBPageSkeleton: React.FC<{ type?: 'dashboard' | 'account' | 'transaction' }> = ({
  type = 'dashboard',
}) => {
  if (type === 'account') {
    return (
      <PageSkeletonContainer>
        {[...Array(3)].map((_, i) => (
          <KBAccountSkeleton key={i} />
        ))}
      </PageSkeletonContainer>
    );
  }

  if (type === 'transaction') {
    return (
      <>
        <PageSkeletonContainer style={{ paddingBottom: '10px' }}>
          <KBAccountSkeleton />
        </PageSkeletonContainer>
        <div>
          {[...Array(10)].map((_, i) => (
            <KBTransactionSkeleton key={i} />
          ))}
        </div>
      </>
    );
  }

  // Dashboard skeleton
  return (
    <>
      <KBBannerSkeleton />
      <PageSkeletonContainer>
        <SkeletonText width='100px' height='20px' marginBottom='16px' />
        <KBAccountSkeleton />
        <KBAccountSkeleton />

        <div style={{ marginTop: '24px' }}>
          <SkeletonText width='80px' height='18px' marginBottom='16px' />
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {[...Array(8)].map((_, i) => (
              <KBMenuItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </PageSkeletonContainer>
    </>
  );
};

// 스켈레톤 로딩 상태 관리 Hook
export const useSkeletonLoading = (isLoading: boolean, delay: number = 200) => {
  const [showSkeleton, setShowSkeleton] = React.useState(isLoading);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      setShowSkeleton(true);
    } else {
      // 로딩이 끝나도 최소 시간 동안 스켈레톤 표시 (깜빡임 방지)
      timer = setTimeout(() => setShowSkeleton(false), delay);
    }

    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  return showSkeleton;
};
