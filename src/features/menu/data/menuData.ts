import { MenuData, MenuCategory } from '../types/menuTypes';

/**
 * KB 스타뱅킹 전체 메뉴 데이터 - 원본 스크린샷 100% 복제
 * 실제 KB 스타뱅킹 앱의 메뉴 구조와 완전히 일치
 */
export const menuData: { [key: string]: MenuData } = {
  // 최근/My메뉴
  recent: {
    sections: [
      {
        title: '최근 이용 메뉴',
        items: [],
        highlighted: true,
        message: '로그인 후 이용할 수 있습니다.',
      },
      {
        title: 'My메뉴',
        items: [],
        highlighted: true,
        message: '로그인 후 이용할 수 있습니다.',
        hasButton: true,
        buttonText: '설정',
      },
    ],
  },

  // 조회
  inquiry: {
    sections: [
      {
        title: '조회',
        items: [
          { name: '전체계좌조회' },
          { name: '통합거래내역조회' },
          { name: '해지계좌조회' },
          { name: '휴면예금·보험금 찾기' },
          { name: '수수료 납부내역조회' },
          { name: 'ID모아보기 계좌조회' },
          { name: '계좌통합관리서비스(어카운팅포)' },
        ],
        highlighted: true,
      },
    ],
  },

  // 이체
  transfer: {
    sections: [
      {
        title: '이체',
        items: [{ name: '이체' }, { name: '이체결과조회(이체확인증)' }],
        highlighted: true,
      },
    ],
  },

  // 상품가입
  products: {
    sections: [
      {
        title: '상품가입',
        items: [
          { name: '입출금통장' },
          { name: '적금' },
          { name: '정기예금' },
          { name: '대출' },
          { name: '카드' },
          { name: '보험' },
          { name: '펀드' },
          { name: '외화' },
        ],
        highlighted: true,
      },
    ],
  },

  // 가업상품관리
  business: {
    sections: [
      {
        title: '가업상품관리',
        items: [
          { name: '입출금' },
          { name: '예적금' },
          { name: '외화예적금' },
          { name: '대출' },
          { name: '퇴직연금' },
          { name: '펀드' },
          { name: '신탁' },
          { name: 'ISA' },
          { name: '청약/채권' },
          { name: '골드투자통장' },
          { name: '보험' },
          { name: '노란우산' },
        ],
        highlighted: true,
      },
    ],
  },

  // 자산관리
  assets: {
    sections: [
      {
        title: '자산관리',
        items: [
          { name: '펀드' },
          { name: '신탁' },
          { name: '골드/실버' },
          { name: 'ISA' },
          { name: '청약/채권' },
        ],
        highlighted: true,
      },
    ],
  },

  // 외환
  fx: {
    sections: [
      {
        title: '외환',
        items: [{ name: '환전' }, { name: '환율조회' }, { name: '외화예금' }, { name: '외화송금' }],
        highlighted: true,
      },
    ],
  },

  // 금융편의
  convenience: {
    sections: [
      {
        title: '금융편의',
        items: [
          { name: '간편결제' },
          { name: 'QR결제' },
          { name: '모바일상품권' },
          { name: 'KB Pay' },
        ],
        highlighted: true,
      },
    ],
  },

  // 혜택
  benefits: {
    sections: [
      {
        title: '혜택',
        items: [{ name: '이벤트' }, { name: '쿠폰' }, { name: '포인트' }, { name: '적립혜택' }],
        highlighted: true,
      },
    ],
  },

  // 멤버십
  membership: {
    sections: [
      {
        title: '멤버십',
        items: [
          { name: 'KB멤버십' },
          { name: '포인트조회' },
          { name: '등급혜택' },
          { name: '멤버십카드' },
        ],
        highlighted: true,
      },
    ],
  },

  // 공과금
  bills: {
    sections: [
      {
        title: '공과금',
        items: [
          { name: '공과금자동납부' },
          { name: '공과금즉시납부' },
          { name: '공과금조회' },
          { name: '지방세납부' },
          { name: '국세납부' },
        ],
        highlighted: true,
      },
    ],
  },

  // 생활/제휴
  lifestyle: {
    sections: [
      {
        title: '생활/제휴',
        items: [
          { name: '생활서비스' },
          { name: '제휴서비스' },
          { name: '쇼핑' },
          { name: '배달' },
          { name: '택시' },
          { name: '주차' },
        ],
        highlighted: true,
      },
    ],
  },
};

/**
 * 메뉴 카테고리 목록 - 원본 스크린샷 순서대로 정확히 배치
 */
export const menuCategories: MenuCategory[] = [
  { key: 'recent', label: '최근/My메뉴' },
  { key: 'inquiry', label: '조회' },
  { key: 'transfer', label: '이체' },
  { key: 'products', label: '상품가입' },
  { key: 'business', label: '가업상품관리' },
  { key: 'assets', label: '자산관리' },
  { key: 'bills', label: '공과금' },
  { key: 'fx', label: '외환' },
  { key: 'convenience', label: '금융편의' },
  { key: 'benefits', label: '혜택' },
  { key: 'membership', label: '멤버십' },
  { key: 'lifestyle', label: '생활/제휴' },
];
