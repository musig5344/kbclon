/**
 * React Query Client 설정
 * 캐싱 및 쿼리 관리를 위한 중앙 설정
 */
import { QueryClient } from '@tanstack/react-query';

// Query Client 인스턴스 생성
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 10, // 10분 (cacheTime이 gcTime으로 변경됨)
      retry: 2,
      refetchOnWindowFocus: false, // 금융 앱 특성상 자동 새로고침 비활성화
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// 캐시 워밍업 함수 (필요시 사용)
export const warmupCache = async () => {
  // 초기 로딩 시 필요한 데이터 미리 불러오기
  console.log('Cache warming up...');
  return Promise.resolve();
};

// 캐시 복원 함수 (필요시 사용)
export const restoreCache = async () => {
  // 로컬 스토리지에서 캐시 복원
  console.log('Restoring cache...');
  return Promise.resolve();
};

// 캐시 클리어 함수
export const clearCache = () => {
  queryClient.clear();
};

// 특정 쿼리 무효화
export const invalidateQuery = (queryKey: string[]) => {
  queryClient.invalidateQueries({ queryKey });
};

// 특정 쿼리 리페치
export const refetchQuery = (queryKey: string[]) => {
  queryClient.refetchQueries({ queryKey });
};

// 캐시 통계 정보 조회
export const getCacheStats = () => {
  const queryCache = queryClient.getQueryCache();
  const mutationCache = queryClient.getMutationCache();
  
  const queries = queryCache.getAll();
  const mutations = mutationCache.getAll();
  
  // 메모리 캐시 키 수집
  const memoryKeys = queries.map(query => query.queryHash);
  
  // LocalStorage 사용량 계산
  let localStorageSize = 0;
  let localStorageCount = 0;
  try {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        localStorageCount++;
        localStorageSize += (localStorage.getItem(key)?.length || 0) + key.length;
      }
    }
  } catch (error) {
    // localStorage 접근 불가 시 기본값
  }
  
  return Promise.resolve({
    memory: {
      count: queries.length,
      keys: memoryKeys
    },
    localStorage: {
      count: localStorageCount,
      size: localStorageSize
    },
    indexedDB: {
      count: 0 // IndexedDB 구현 시 추가
    },
    reactQuery: {
      queries: queries.length,
      mutations: mutations.length
    }
  });
};