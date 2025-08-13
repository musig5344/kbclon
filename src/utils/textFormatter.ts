/**
 * KB 스타뱅킹 원본 앱의 텍스트 포맷팅 유틸리티
 * - 한글: 스페이스 없이 표기
 * - 영문/숫자/특수문자: 각 문자 사이에 스페이스 추가 (예: NETFLIX → N E T F L I X)
 */
// 한글 여부 체크
const isKorean = (char: string): boolean => {
  const code = char.charCodeAt(0);
  // 한글 유니코드 범위: AC00-D7AF (가-힣)
  return code >= 0xAC00 && code <= 0xD7AF;
};
// 한글 자음/모음 체크
const isKoreanJamo = (char: string): boolean => {
  const code = char.charCodeAt(0);
  // 한글 자음: 3131-314E, 한글 모음: 314F-3163
  return (code >= 0x3131 && code <= 0x314E) || (code >= 0x314F && code <= 0x3163);
};
// 공백 문자 체크
const isWhitespace = (char: string): boolean => {
  return /\s/.test(char);
};
/**
 * KB 스타뱅킹 스타일 텍스트 포맷터
 * @param text 원본 텍스트
 * @returns 포맷된 텍스트
 */
export const formatTransactionText = (text: string): string => {
  if (!text) return '';
  let result = '';
  let prevWasKorean = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    // 공백은 그대로 유지
    if (isWhitespace(char)) {
      result += char;
      prevWasKorean = false;
      continue;
    }
    // 현재 문자가 한글인지 확인
    const isCurrentKorean = isKorean(char) || isKoreanJamo(char);
    const isNextKorean = nextChar && (isKorean(nextChar) || isKoreanJamo(nextChar));
    if (isCurrentKorean) {
      // 이전 문자가 영문/숫자였으면 공백 추가
      if (i > 0 && !prevWasKorean && result.length > 0 && !isWhitespace(result[result.length - 1])) {
        result += ' ';
      }
      // 한글은 그대로 붙여서 표기
      result += char;
      prevWasKorean = true;
    } else {
      // 영문/숫자/특수문자
      if (prevWasKorean && result.length > 0 && !isWhitespace(result[result.length - 1])) {
        // 한글에서 영문/숫자로 전환시 스페이스 추가
        result += ' ';
      }
      result += char;
      // 다음 문자도 영문/숫자/특수문자이고 공백이 아니면 스페이스 추가
      if (nextChar && !isNextKorean && !isWhitespace(nextChar)) {
        result += ' ';
      }
      prevWasKorean = false;
    }
  }
  // 마지막 불필요한 공백 제거
  return result.trim();
};
/**
 * 금액 포맷터 (원화)
 * @param amount 금액
 * @returns 포맷된 금액 문자열
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(amount);
};
/**
 * 날짜 포맷터 (MM.DD HH:mm)
 * @param date 날짜 문자열 또는 Date 객체
 * @returns 포맷된 날짜 문자열
 */
export const formatTransactionDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  return `${month}.${day} ${hours}:${minutes}`;
};
/**
 * 날짜 헤더 포맷터 (YYYY.MM.DD)
 * @param date 날짜 문자열 또는 Date 객체
 * @returns 포맷된 날짜 문자열
 */
export const formatDateHeader = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};
// 테스트 케이스
// ; // N E T F L I X
// ; // 스타벅스
// ; // G S 2 5 편의점
// ; // C U   편의점
// ; // 이마트 2 4