/**
 * KB StarBanking 키보드 네비게이션 통합 예제
 * 기존 컴포넌트들과 키보드 시스템을 통합하는 방법을 보여주는 예제
 */

import React, { useState, useRef, useEffect } from 'react';

import styled from 'styled-components';

// 기존 컴포넌트들 (예시)
import { Button } from '../../shared/components/ui/Button';
import { Modal } from '../../shared/components/ui/Modal';
import {
  KeyboardProvider,
  useKeyboardNavigation,
  useKeyboardShortcuts,
  useKeyboard,
  KeyboardButton,
  KeyboardDropdown,
  KeyboardNumberPad,
  CommandPalette,
  CommandPaletteItem,
} from '../index';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Section = styled.section`
  margin-bottom: 32px;
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const InfoBox = styled.div`
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
`;

// 통합 예제 컴포넌트
const KeyboardNavigationExample: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 메인 영역 키보드 네비게이션
  const { currentIndex, focusedElement, navigateNext, navigatePrevious, enable, disable } =
    useKeyboardNavigation(mainRef, {
      wrap: true,
      announceChanges: true,
      onNavigate: (element, direction) => {},
    });

  // 키보드 컨텍스트 사용
  const { settings, registerShortcut, unregisterShortcut } = useKeyboard();

  // 글로벌 단축키 등록
  useKeyboardShortcuts([
    {
      id: 'example-help',
      keys: ['f1'],
      description: '도움말 표시',
      action: () => alert('F1: 도움말\nCtrl+K: 명령 팔레트\nCtrl+M: 모달 열기'),
      context: ['global'],
    },
    {
      id: 'example-modal',
      keys: ['ctrl+m'],
      description: '모달 열기',
      action: () => setShowModal(true),
      context: ['global'],
    },
    {
      id: 'example-command-palette',
      keys: ['ctrl+k'],
      description: '명령 팔레트 열기',
      action: () => setShowCommandPalette(true),
      context: ['global'],
    },
  ]);

  // 컨텍스트별 단축키 (모달이 열렸을 때만)
  useKeyboardShortcuts(
    [
      {
        id: 'modal-close',
        keys: ['escape'],
        description: '모달 닫기',
        action: () => setShowModal(false),
        context: ['modal'],
      },
    ],
    {
      context: showModal ? ['modal'] : [],
      enabled: showModal,
    }
  );

  // 계좌 옵션
  const accountOptions = [
    { value: 'account1', label: '국민은행 123-456-789012 (김철수)', icon: '🏦' },
    { value: 'account2', label: '국민은행 987-654-321098 (김영희)', icon: '🏦' },
    { value: 'account3', label: '국민은행 555-666-777888 (회사계좌)', icon: '🏢' },
  ];

  // 명령 팔레트 아이템들
  const commandPaletteItems: CommandPaletteItem[] = [
    {
      id: 'transfer',
      title: '이체하기',
      description: '다른 계좌로 돈을 이체합니다',
      keywords: ['이체', '송금', 'transfer'],
      category: '거래',
      shortcut: ['Ctrl', 'T'],
      icon: '💸',
    },
    {
      id: 'balance',
      title: '잔액 조회',
      description: '계좌 잔액을 확인합니다',
      keywords: ['잔액', '조회', 'balance'],
      category: '조회',
      shortcut: ['Ctrl', 'B'],
      icon: '💰',
    },
    {
      id: 'history',
      title: '거래 내역',
      description: '거래 내역을 조회합니다',
      keywords: ['내역', '거래', 'history'],
      category: '조회',
      icon: '📋',
    },
    {
      id: 'settings',
      title: '설정',
      description: '앱 설정을 변경합니다',
      keywords: ['설정', 'settings'],
      category: '기타',
      icon: '⚙️',
    },
  ];

  // 이체 실행 함수
  const handleTransfer = () => {
    if (!selectedAccount || !transferAmount) {
      alert('계좌와 금액을 모두 입력해주세요.');
      return;
    }

    alert(`${selectedAccount}로 ${transferAmount}원을 이체합니다.`);
  };

  // 모달 열기 시 포커스 관리
  useEffect(() => {
    if (showModal) {
      // 메인 영역 키보드 네비게이션 비활성화
      disable();
    } else {
      // 메인 영역 키보드 네비게이션 활성화
      enable();
    }
  }, [showModal, enable, disable]);

  return (
    <Container>
      <h1>키보드 네비게이션 통합 예제</h1>

      <InfoBox>
        <strong>키보드 단축키:</strong>
        <ul>
          <li>
            <kbd>F1</kbd>: 도움말
          </li>
          <li>
            <kbd>Ctrl+K</kbd>: 명령 팔레트
          </li>
          <li>
            <kbd>Ctrl+M</kbd>: 모달 열기
          </li>
          <li>
            <kbd>Tab</kbd>/<kbd>Shift+Tab</kbd>: 네비게이션
          </li>
          <li>
            <kbd>Enter</kbd>/<kbd>Space</kbd>: 활성화
          </li>
        </ul>
      </InfoBox>

      <div ref={mainRef}>
        <Section>
          <SectionTitle>1. 기본 버튼들</SectionTitle>
          <Grid>
            {/* 키보드 최적화 버튼 */}
            <KeyboardButton variant='primary' shortcut={['Ctrl', 'Enter']} announceAction={true}>
              키보드 버튼
            </KeyboardButton>

            {/* 기존 버튼 (키보드 지원 제한적) */}
            <Button variant='secondary'>기존 버튼</Button>

            <KeyboardButton variant='danger' leftIcon='🗑️'>
              삭제
            </KeyboardButton>

            <KeyboardButton variant='text' rightIcon='→' href='/next-page'>
              다음 페이지
            </KeyboardButton>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>2. 이체 폼</SectionTitle>

          <KeyboardDropdown
            label='받는 계좌'
            options={accountOptions}
            value={selectedAccount}
            onChange={setSelectedAccount}
            placeholder='계좌를 선택하세요'
            searchable={true}
          />

          <div style={{ marginTop: '16px' }}>
            <KeyboardNumberPad
              label='이체 금액'
              value={transferAmount}
              onChange={setTransferAmount}
              maxLength={10}
              currency={true}
              placeholder='금액을 입력하세요'
            />
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <KeyboardButton variant='primary' onClick={handleTransfer} shortcut={['Ctrl', 'Enter']}>
              이체하기
            </KeyboardButton>

            <KeyboardButton
              variant='secondary'
              onClick={() => {
                setSelectedAccount('');
                setTransferAmount('');
              }}
            >
              초기화
            </KeyboardButton>
          </div>
        </Section>

        <Section>
          <SectionTitle>3. 네비게이션 상태</SectionTitle>
          <InfoBox>
            <p>
              <strong>현재 포커스 인덱스:</strong> {currentIndex}
            </p>
            <p>
              <strong>포커스된 요소:</strong> {focusedElement?.tagName || 'None'}
            </p>
            <p>
              <strong>키보드 모드:</strong> {settings.mode}
            </p>
            <p>
              <strong>변경사항 공지:</strong> {settings.announceChanges ? '활성' : '비활성'}
            </p>
          </InfoBox>

          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <KeyboardButton onClick={navigateNext} size='small'>
              다음 요소
            </KeyboardButton>
            <KeyboardButton onClick={navigatePrevious} size='small'>
              이전 요소
            </KeyboardButton>
          </div>
        </Section>

        <Section>
          <SectionTitle>4. 모달 및 트랩</SectionTitle>
          <KeyboardButton
            variant='outline'
            onClick={() => setShowModal(true)}
            shortcut={['Ctrl', 'M']}
          >
            모달 열기
          </KeyboardButton>
        </Section>
      </div>

      {/* 모달 예제 */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title='키보드 트랩 모달'
          ref={modalRef}
        >
          <div>
            <p>이 모달은 키보드 트랩이 적용되어 있습니다.</p>
            <p>Tab 키로 내부 요소들만 탐색할 수 있습니다.</p>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <KeyboardButton variant='primary'>확인</KeyboardButton>
              <KeyboardButton variant='secondary' onClick={() => setShowModal(false)}>
                취소
              </KeyboardButton>
            </div>
          </div>
        </Modal>
      )}

      {/* 명령 팔레트 */}
      <CommandPalette
        isOpen={showCommandPalette}
        items={commandPaletteItems}
        onClose={() => setShowCommandPalette(false)}
        onExecute={item => {
          setShowCommandPalette(false);
        }}
        placeholder='명령어를 입력하세요...'
        enableFuzzySearch={true}
        showCategories={true}
        showShortcuts={true}
      />
    </Container>
  );
};

// 메인 앱 컴포넌트 (KeyboardProvider로 감싸기)
const App: React.FC = () => {
  return (
    <KeyboardProvider
      initialSettings={{
        enabled: true,
        mode: 'normal',
        announceChanges: true,
        showFocusRing: true,
        enableCommandPalette: true,
      }}
      onSettingsChange={settings => {}}
    >
      <KeyboardNavigationExample />
    </KeyboardProvider>
  );
};

export default App;
