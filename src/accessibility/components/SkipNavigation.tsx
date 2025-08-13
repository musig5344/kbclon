/**
 * 스킵 네비게이션 컴포넌트
 * WCAG 2.1 키보드 네비게이션 개선
 */

import React, { useState, useEffect } from 'react';

import styled from 'styled-components';

import { SkipLinkTarget } from '../types';
import { setFocus } from '../utils/focusManagement';
import { announce } from '../utils/screenReader';

interface Props {
  targets?: SkipLinkTarget[];
  className?: string;
}

const SkipNavContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
`;

const SkipLink = styled.a`
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.kbYellow};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 12px 24px;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:focus {
    position: fixed;
    top: 8px;
    left: 8px;
    width: auto;
    height: auto;
    overflow: visible;
    outline: 2px solid ${({ theme }) => theme.colors.textPrimary};
    outline-offset: 2px;
    z-index: 10000;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.buttonYellowPressed};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const defaultTargets: SkipLinkTarget[] = [
  { id: 'main-content', label: '본문 바로가기' },
  { id: 'navigation', label: '주 메뉴 바로가기' },
  { id: 'search', label: '검색 바로가기' },
  { id: 'footer', label: '하단 정보 바로가기' }
];

export const SkipNavigation: React.FC<Props> = ({ 
  targets = defaultTargets,
  className 
}) => {
  const [visibleTargets, setVisibleTargets] = useState<SkipLinkTarget[]>([]);

  useEffect(() => {
    // 실제로 존재하는 요소만 필터링
    const existingTargets = targets.filter(target => {
      const element = document.getElementById(target.id);
      return element !== null;
    });
    
    setVisibleTargets(existingTargets);
  }, [targets]);

  const handleSkipLink = (e: React.MouseEvent<HTMLAnchorElement>, target: SkipLinkTarget) => {
    e.preventDefault();
    
    const element = document.getElementById(target.id);
    if (element) {
      // tabindex 설정하여 포커스 가능하게 만들기
      const originalTabIndex = element.getAttribute('tabindex');
      element.setAttribute('tabindex', '-1');
      
      // 포커스 이동
      setFocus(element, { preventScroll: false });
      
      // 스크롤
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      // 원래 tabindex로 복원
      if (originalTabIndex) {
        element.setAttribute('tabindex', originalTabIndex);
      } else {
        element.removeAttribute('tabindex');
      }
      
      // 스크린 리더 공지
      announce(`${target.label} 영역으로 이동했습니다.`);
    }
  };

  if (visibleTargets.length === 0) {
    return null;
  }

  return (
    <SkipNavContainer className={className}>
      {visibleTargets.map((target, index) => (
        <SkipLink
          key={target.id}
          href={`#${target.id}`}
          onClick={(e) => handleSkipLink(e, target)}
          style={{ top: index * 50 }}
        >
          {target.label}
        </SkipLink>
      ))}
    </SkipNavContainer>
  );
};

// 자주 사용되는 스킵 링크 프리셋
export const AccountPageSkipLinks: SkipLinkTarget[] = [
  { id: 'account-info', label: '계좌 정보 바로가기' },
  { id: 'transaction-list', label: '거래 내역 바로가기' },
  { id: 'quick-actions', label: '빠른 작업 바로가기' }
];

export const TransferPageSkipLinks: SkipLinkTarget[] = [
  { id: 'from-account', label: '출금 계좌 선택 바로가기' },
  { id: 'to-account', label: '입금 계좌 입력 바로가기' },
  { id: 'amount-input', label: '금액 입력 바로가기' },
  { id: 'transfer-confirm', label: '이체 확인 바로가기' }
];

export const MenuPageSkipLinks: SkipLinkTarget[] = [
  { id: 'menu-search', label: '메뉴 검색 바로가기' },
  { id: 'quick-menu', label: '자주 찾는 메뉴 바로가기' },
  { id: 'all-menu', label: '전체 메뉴 바로가기' }
];