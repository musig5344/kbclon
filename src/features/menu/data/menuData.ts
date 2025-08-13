import { MenuData, MenuCategory } from '../types/menuTypes';

/**
 * KB 스타뱅킹 전체 메뉴 데이터
 * 실제 KB 스타뱅킹 앱의 메뉴 구조를 기반으로 구성
 */
export const menuData: { [key: string]: MenuData } = {
  recent: {
    sections: [
      {
        title: "최근 이용 메뉴",
        items: [
          { name: "전체계좌조회" },
          { name: "이체" },
          { name: "통합거래내역조회" },
          { name: "정기예금" },
          { name: "카드결제내역조회" }
        ],
        highlighted: true
      },
      {
        title: "조회",
        items: [
          { name: "전체계좌조회" },
          { name: "통합거래내역조회" },
          { name: "해지계좌조회" },
          { name: "휴면예금·보험금 찾기" },
          { name: "수수료 납부내역조회" },
          { name: "ID모아보기 계좌조회" }
        ],
        highlighted: true
      }
    ]
  },
  inquiry: {
    sections: [
      {
        title: "조회",
        items: [
          { name: "전체계좌조회" },
          { name: "통합거래내역조회" },
          { name: "해지계좌조회" },
          { name: "휴면예금·보험금 찾기" },
          { name: "수수료 납부내역조회" },
          { name: "ID모아보기 계좌조회" },
          { name: "계좌통합관리서비스(어카운팅포)" }
        ],
        highlighted: true
      }
    ]
  },
  transfer: {
    sections: [
      {
        title: "이체",
        items: [
          { name: "이체" },
          { name: "이체결과조회(이체확인증)" },
          { name: "자동이체", hasDropdown: true },
          { name: "이체한도 조회/변경" },
          { name: "이체관리", hasDropdown: true },
          { name: "잔액모으기" },
          { name: "ID모아보기", hasDropdown: true },
          { name: "계좌이동서비스(자동이체통합관리)" }
        ],
        highlighted: true
      }
    ]
  },
  products: {
    sections: [
      {
        title: "상품가입",
        items: [
          { name: "금융상품" },
          { name: "입출금+카드" },
          { name: "적금" },
          { name: "정기예금" },
          { name: "외화예적금" },
          { name: "대출" },
          { name: "퇴직연금" },
          { name: "펀드" },
          { name: "신탁" },
          { name: "ISA" },
          { name: "청약/채권" },
          { name: "골드/실버" }
        ],
        highlighted: true
      }
    ]
  },
  business: {
    sections: [
      {
        title: "가업상품관리",
        items: [
          { name: "입출금" },
          { name: "예적금" },
          { name: "외화예적금" },
          { name: "대출" },
          { name: "퇴직연금" },
          { name: "펀드" },
          { name: "신탁" },
          { name: "ISA" },
          { name: "청약/채권" },
          { name: "골드투자통장" },
          { name: "보험" },
          { name: "노란우산" }
        ],
        highlighted: true
      }
    ]
  },
  assets: {
    sections: [
      {
        title: "자산관리",
        items: [
          { name: "펀드" },
          { name: "신탁" },
          { name: "골드/실버" }
        ]
      }
    ]
  },
  bills: {
    sections: [
      {
        title: "공과금",
        items: [
          { name: "자동납부" },
          { name: "공과금 조회" }
        ]
      }
    ]
  },
  fx: {
    sections: [
      {
        title: "외환",
        items: [
          { name: "환전" },
          { name: "환율조회" }
        ]
      }
    ]
  },
  convenience: {
    sections: [
      {
        title: "금융편의",
        items: [
          { name: "간편결제" },
          { name: "QR결제" }
        ]
      }
    ]
  },
  benefits: {
    sections: [
      {
        title: "혜택",
        items: [
          { name: "이벤트" },
          { name: "쿠폰" }
        ]
      }
    ]
  },
  membership: {
    sections: [
      {
        title: "멤버십",
        items: [
          { name: "KB멤버십" },
          { name: "포인트조회" }
        ]
      }
    ]
  },
  lifestyle: {
    sections: [
      {
        title: "생활/제휴",
        items: [
          { name: "생활서비스" },
          { name: "제휴서비스" }
        ]
      }
    ]
  }
};

/**
 * 메뉴 카테고리 목록
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
  { key: 'lifestyle', label: '생활/제휴' }
];