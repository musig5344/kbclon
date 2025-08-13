/**
 * Supabase 연결 테스트 유틸리티
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    // 환경변수 확인
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Supabase 환경변수가 설정되지 않았습니다. .env 파일을 확인해주세요.'
      };
    }
    // 기본 연결 테스트
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    if (error) {
      return {
        success: false,
        message: `Supabase 연결 실패: ${error.message}`
      };
    }
    return {
      success: true,
      message: `Supabase 연결 성공! 총 ${data || 0}명의 사용자가 등록되어 있습니다.`,
      data: { userCount: data }
    };
  } catch (error: any) {
    return {
      success: false,
      message: `연결 테스트 중 오류 발생: ${error.message || error}`
    };
  }
};
export const testDatabaseTables = async (): Promise<{
  success: boolean;
  message: string;
  tables?: Record<string, number>;
}> => {
  try {
    const results = await Promise.allSettled([
      supabase.from('users').select('count', { count: 'exact', head: true }),
      supabase.from('accounts').select('count', { count: 'exact', head: true }),
      supabase.from('transactions').select('count', { count: 'exact', head: true }),
      supabase.from('transfer_history').select('count', { count: 'exact', head: true })
    ]);
    const tables: Record<string, number> = {};
    const tableNames = ['users', 'accounts', 'transactions', 'transfer_history'];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && !result.value.error) {
        tables[tableNames[index]] = result.value.count || 0;
      } else {
        tables[tableNames[index]] = -1; // 오류 표시
      }
    });
    const successCount = Object.values(tables).filter(count => count >= 0).length;
    return {
      success: successCount === tableNames.length,
      message: `${successCount}/${tableNames.length} 테이블 접근 성공`,
      tables
    };
  } catch (error: any) {
    return {
      success: false,
      message: `테이블 테스트 중 오류 발생: ${error.message || error}`
    };
  }
};
export const testUserAuthentication = async (): Promise<{
  success: boolean;
  message: string;
  session?: any;
}> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      return {
        success: false,
        message: `인증 세션 확인 실패: ${error.message}`
      };
    }
    return {
      success: true,
      message: session ? '활성 세션이 있습니다.' : '현재 로그인된 사용자가 없습니다.',
      session
    };
  } catch (error: any) {
    return {
      success: false,
      message: `인증 테스트 중 오류 발생: ${error.message || error}`
    };
  }
};
// 통합 테스트 실행
export const runAllTests = async () => {
  const connectionTest = await testSupabaseConnection();
  const tablesTest = await testDatabaseTables();
  if (tablesTest.tables) {
    Object.entries(tablesTest.tables).forEach(([table, count]) => {
    });
  }
  const authTest = await testUserAuthentication();
  return {
    connection: connectionTest,
    tables: tablesTest,
    auth: authTest,
    overall: connectionTest.success && tablesTest.success && authTest.success
  };
};