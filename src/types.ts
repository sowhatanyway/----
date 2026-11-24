export type ScentKey = 'chamo' | 'pumkini' | 'evening' | 'metal';

export type ProductVisualKey = ScentKey | 'lale' | 'candle';

export interface ScentInfo {
  key: ScentKey;
  name: string;
  koreanName: string;
  badge: string;
  color: string;
  mistColor: string;
  fontClass: string;
  quotes: string[];
  glitterColors: string[];
  topNotes: string;
  middleNotes: string;
  baseNotes: string;
  description: string;
}

export interface CollectionItem {
  id: string;
  scentKey?: ScentKey;
  visualKey: ProductVisualKey;
  category: string;
  name: string;
  koreanName: string;
  volume: string;
  priceKRW: number;
  imageUrl: string;
  description: string;
  badgeText: string;
  badgeBg: string;
  bgGrad: string;
  topNotes: string;
  middleNotes: string;
  baseNotes: string;
  extraMeta?: { label: string; value: string }[];
}

export interface QuizQuestion {
  question: string;
  options: {
    key: ScentKey;
    label: string;
    subLabel: string;
    title: string;
  }[];
}

export interface AuraAnalysisResult {
  scentKey: ScentKey;
  title: string;
  warmth: number;
  elegance: number;
  coolness: number;
  description: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type PaymentMethod = '신용/체크카드' | '간편결제' | '무통장입금';

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  memo: string;
  paymentMethod: PaymentMethod;
}

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  koreanName: string;
  volume: string;
  priceKRW: number;
  quantity: number;
  imageUrl: string;
}

export interface OrderRecord {
  orderId: string;
  createdAt: string;
  items: OrderItemSnapshot[];
  subtotalKRW: number;
  shippingKRW: number;
  totalAmount: number;
  customer: CustomerInfo;
  status: string;
}

export type ReviewScentTag =
  | '데일리'
  | '지속력'
  | '선물용'
  | '잔향 지속력 좋음'
  | '데일리 추천'
  | '선물용 추천'
  | '유니크한 무드'
  | '계절감 완벽';

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  scentTag: ReviewScentTag;
  comment: string;
  createdAt: string;
  helpfulCount: number;
  verifiedPurchase?: boolean;
}

export interface OfflineEvent {
  id: string;
  status: '진행 중' | '상설 전시' | '사전 예약';
  category: string;
  title: string;
  subtitle: string;
  period: string;
  venueName: string;
  regionLabel: string;
  storeSearchQuery: string;
  highlightNote: string;
  description: string;
  scentColor: string;
}

export interface BrandNotice {
  id: string;
  tag: '공지' | '전시' | '스토어' | '배송';
  title: string;
  date: string;
  isPinned?: boolean;
  summary: string;
  details: string;
}

export interface MemberUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  passwordHash: string;
  createdAt: string;
}

export type MapProviderId = 'google' | 'kakao' | 'naver';

export interface CuratedStoreGuide {
  id: string;
  regionId: string;
  name: string;
  badge: '플래그십' | '쇼룸' | '백화점' | '글로벌';
  area: string;
  districtHint: string;
  mapQuery: string;
  keywords: string[];
}

