/**
 * 캐시 관리 UI 컴포넌트
 * 개발/디버깅을 위한 캐시 상태 모니터링 및 관리 도구
 */
import React, { useState, useEffect } from 'react';

import styled from 'styled-components';

import { getCacheStats } from '../../core/cache/queryClient';
import { useCacheManagement } from '../../services/cachedApiService';
import Button from '../../shared/components/ui/Button';
import { safeLog } from '../../utils/errorHandler';

const Container = styled.div`
  position: fixed;
  bottom: 80px;
  right: 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  
  &.dark {
    background: #1e1e1e;
    border-color: #444;
    color: white;
  }
`;

const Title = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: bold;
`;

const Section = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  
  .dark & {
    color: #aaa;
  }
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
`;

const StatLabel = styled.span`
  color: #666;
  
  .dark & {
    color: #999;
  }
`;

const StatValue = styled.span`
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const SmallButton = styled(Button)`
  padding: 4px 12px;
  font-size: 12px;
`;

const ToggleButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #ffcc00;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  z-index: 1001;
  
  &:hover {
    background: #ffb700;
  }
`;

interface CacheStats {
  memory: { count: number; keys: string[] };
  localStorage: { count: number; size: number };
  indexedDB: { count: number };
  reactQuery: { queries: number; mutations: number };
}

export const CacheManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { clearAllCache, refreshAccount, refreshTransactions, getCacheStatus } = useCacheManagement();

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const cacheStats = await getCacheStats();
      setStats(cacheStats as CacheStats);
    } catch (error) {
      safeLog('error', '캐시 통계 로드 실패', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStats();
      // 5초마다 자동 갱신
      const interval = setInterval(loadStats, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleClearAll = async () => {
    if (window.confirm('모든 캐시를 삭제하시겠습니까?')) {
      setIsLoading(true);
      await clearAllCache();
      await loadStats();
      setIsLoading(false);
    }
  };

  const handleClearServiceWorkerCache = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE',
        target: 'all'
      });
      safeLog('info', '서비스 워커 캐시 삭제 요청 전송');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) {
    return (
      <ToggleButton onClick={() => setIsOpen(true)} title="캐시 관리자 열기">
        🗄️
      </ToggleButton>
    );
  }

  return (
    <Container className={document.body.classList.contains('dark') ? 'dark' : ''}>
      <Title>
        캐시 관리자
        <button
          onClick={() => setIsOpen(false)}
          style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer' }}
        >
          ✕
        </button>
      </Title>

      {isLoading && <div>로딩 중...</div>}

      {stats && (
        <>
          <Section>
            <SectionTitle>메모리 캐시</SectionTitle>
            <StatItem>
              <StatLabel>캐시 항목 수</StatLabel>
              <StatValue>{stats.memory.count}개</StatValue>
            </StatItem>
            {stats.memory.keys.length > 0 && (
              <details style={{ marginTop: '8px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '12px' }}>
                  캐시 키 목록
                </summary>
                <div style={{ fontSize: '11px', marginTop: '4px', maxHeight: '100px', overflow: 'auto' }}>
                  {stats.memory.keys.map((key, index) => (
                    <div key={index} style={{ marginBottom: '2px', wordBreak: 'break-all' }}>
                      {key}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </Section>

          <Section>
            <SectionTitle>localStorage</SectionTitle>
            <StatItem>
              <StatLabel>캐시 항목 수</StatLabel>
              <StatValue>{stats.localStorage.count}개</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>사용 용량</StatLabel>
              <StatValue>{formatBytes(stats.localStorage.size)}</StatValue>
            </StatItem>
          </Section>

          <Section>
            <SectionTitle>IndexedDB</SectionTitle>
            <StatItem>
              <StatLabel>캐시 항목 수</StatLabel>
              <StatValue>{stats.indexedDB.count}개</StatValue>
            </StatItem>
          </Section>

          <Section>
            <SectionTitle>React Query</SectionTitle>
            <StatItem>
              <StatLabel>활성 쿼리</StatLabel>
              <StatValue>{stats.reactQuery.queries}개</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>활성 뮤테이션</StatLabel>
              <StatValue>{stats.reactQuery.mutations}개</StatValue>
            </StatItem>
          </Section>

          <Section>
            <SectionTitle>작업</SectionTitle>
            <ButtonGroup>
              <SmallButton onClick={handleClearAll} variant="secondary">
                전체 캐시 삭제
              </SmallButton>
              <SmallButton onClick={handleClearServiceWorkerCache} variant="secondary">
                SW 캐시 삭제
              </SmallButton>
              <SmallButton onClick={loadStats} variant="primary">
                새로고침
              </SmallButton>
            </ButtonGroup>
          </Section>
        </>
      )}
    </Container>
  );
};

// 개발 환경에서만 표시
export const CacheManagerWrapper: React.FC = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <CacheManager />;
};