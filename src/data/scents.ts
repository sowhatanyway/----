import {
  ScentKey,
  ScentInfo,
  CollectionItem,
  QuizQuestion,
  AuraAnalysisResult,
  ProductReview,
  ReviewScentTag
} from '../types.ts';
import { PRODUCT_IMAGES } from './productImages.ts';

export const SCENT_CONFIGS: Record<ScentKey, ScentInfo> = {
  chamo: {
    key: 'chamo',
    name: 'CHAMO',
    koreanName: '카모',
    badge: 'CHAMO · Amber Chamomile Mist',
    color: '#E3B06C',
    mistColor: 'rgba(227, 176, 108, ',
    fontClass: 'font-chamo',
    quotes: [
      '속삭이듯 스며드는 쌉싸래한 카모마일\n온기 있는 블론드 우드의 고요한 안식',
      '차가운 이끼의 기운을 보듬는 우디 노트\n피부 위에 부드럽게 감기는 매혹적인 잔향',
      '마음을 차분히 잠재우는 카모마일 약초 향\n따스하고 부드러운 머스크의 깊은 영원'
    ],
    glitterColors: ['#E3B06C', '#F7D08A', '#FFF3D1', '#D4AF37', '#FFFFFF'],
    topNotes: 'Clary Sage, Chamomile',
    middleNotes: 'Water, Cypriol',
    baseNotes: 'Amber, Musk, Blonde Wood',
    description:
      '진득한 카모마일의 약초 향과 쌉싸래한 클라리세이지가 오묘한 조화를 이루며, 차가운 이끼를 따스한 블론드 우드로 감싸주는 안식의 향.'
  },
  pumkini: {
    key: 'pumkini',
    name: 'PUMKINI',
    koreanName: '펌키니',
    badge: 'PUMKINI · Sweet Pumpkin Crimson Mist',
    color: '#E87D3E',
    mistColor: 'rgba(232, 125, 62, ',
    fontClass: 'font-pumkini',
    quotes: [
      '하얀 호박의 청초하고 달콤한 첫 순간\n차조기잎과 진저가 남기는 감각적 반전',
      '크리미한 코코넛 밀크의 은밀한 여운\n달빛 아래 피어나는 호박의 스윗 센트',
      '베르가못의 쌉싸래한 푸르름과 스파이스\n오묘하고 기분 좋은 감각의 소동'
    ],
    glitterColors: ['#E87D3E', '#FFAA64', '#FFE0C2', '#D96B27', '#FFFFFF'],
    topNotes: 'Bergamot, Perilla Leaf',
    middleNotes: 'Pumpkin, Ginger',
    baseNotes: 'Coconut Milk, Sandalwood',
    description:
      '하얀 호박의 청초하고 달콤한 향에 차조기잎과 베르가못의 쌉싸래한 푸르름이 더해집니다. 잘 여문 호박과 진저의 스파이시함에 크리미한 코코넛 밀크가 남기는 은밀하고 오묘한 잔상.'
  },
  evening: {
    key: 'evening',
    name: 'EVENING GLOW',
    koreanName: '이브닝글로우',
    badge: 'EVENING GLOW · Sunset Rose Mist',
    color: '#C94E6B',
    mistColor: 'rgba(201, 78, 107, ',
    fontClass: 'font-evening',
    quotes: [
      '붉은 노을빛으로 물드는 로맨틱한 장미\n라즈베리와 레몬의 몽환적인 오라',
      '해질녘의 황혼 속에서 피어나는 미학\n패출리와 묵직한 머스크의 영원한 장미',
      '스파클링한 과즙과 탐스러운 장미 앰버\n피부 끝에 감도는 매혹적인 여운'
    ],
    glitterColors: ['#C94E6B', '#F7A8B8', '#FFD1DC', '#9B2D44', '#FFFFFF'],
    topNotes: 'Lemon, Raspberry, Dill',
    middleNotes: 'Rose, Cypriol',
    baseNotes: 'Patchouli, Musk',
    description:
      '모든 장미가 붉은 노을빛으로 물드는 로맨틱한 순간. 신선한 라즈베리와 레몬의 스파클링함에 신비로운 패출리와 머스크 노트가 피어나는 매혹적인 로지 앰버 향.'
  },
  metal: {
    key: 'metal',
    name: 'HOLY METAL',
    koreanName: '홀리메탈',
    badge: 'HOLY METAL · Ice Silver Sage Mist',
    color: '#7DA1A4',
    mistColor: 'rgba(125, 161, 164, ',
    fontClass: 'font-metal',
    quotes: [
      '신성한 성전 속 정적과 차가운 공기\n측백나무 잎과 세이지의 맑은 울림',
      '차가운 알데하이드 금속성과 백머스크\n시간이 멈춘 듯 정갈하고 깨끗한 쉘 잔향',
      '대리석의 고요한 숨결과 신선한 세이지\n명료하고 지적인 아이스 메탈의 기운'
    ],
    glitterColors: ['#7DA1A4', '#B5D5D8', '#E2F1F2', '#4A7073', '#FFFFFF'],
    topNotes: 'Cypress Leaf, Sage',
    middleNotes: 'Incense, Metallic Aldehyde',
    baseNotes: 'White Musk, Cedarwood',
    description:
      '우연히 발길이 닿은 신성한 성전의 차갑고 고요한 공기. 측백나무 잎과 세이지의 깨끗함에 알데하이드 금속성 잔향이 조화를 이루는 손전용 스컬프처 쉘 핸드크림.'
  }
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'Q1. 머물고 싶은 이상적인 공간의 분위기는?',
    options: [
      {
        key: 'chamo',
        label: '따스한 햇살이 드는 아늑한 목조 서재',
        subLabel: '카모마일의 은은함과 목재의 온기 있는 안식',
        title: 'Option A'
      },
      {
        key: 'pumkini',
        label: '비 온 뒤 푸르름이 감도는 비밀 정원',
        subLabel: '차조기잎의 푸르름과 하얀 호박의 반전 매력',
        title: 'Option B'
      },
      {
        key: 'evening',
        label: '붉은 노을로 물드는 해질녘의 테라스',
        subLabel: '매혹적인 로즈 향과 라즈베리의 몽환적 오라',
        title: 'Option C'
      },
      {
        key: 'metal',
        label: '시간이 멈춘 듯 차갑고 고요한 대리석 성전',
        subLabel: '측백나무 잎과 메탈릭 세이지의 신성한 정적',
        title: 'Option D'
      }
    ]
  },
  {
    question: 'Q2. 오랫동안 기억하고 싶은 잔상의 시간대는?',
    options: [
      {
        key: 'chamo',
        label: '선선한 가을 바람이 불어오는 나른한 오후',
        subLabel: '따뜻한 차 한 잔과 부드러운 우디의 여운',
        title: 'Option A'
      },
      {
        key: 'pumkini',
        label: '이슬 젖은 새벽 공기가 피어나는 비밀스러운 순간',
        subLabel: '은밀하게 코끝을 스치는 달콤 쌉싸래한 향기',
        title: 'Option B'
      },
      {
        key: 'evening',
        label: '해가 지는 붉은 황혼의 트와일라잇',
        subLabel: '하늘이 분홍빛과 보랏빛으로 물드는 로맨틱한 찰나',
        title: 'Option C'
      },
      {
        key: 'metal',
        label: '서늘하고 맑은 겨울 성전의 대기',
        subLabel: '잡념이 사라지는 차갑고 깨끗한 침묵의 시간',
        title: 'Option D'
      }
    ]
  },
  {
    question: 'Q3. 끌리는 메인 잔향 노트는?',
    options: [
      {
        key: 'chamo',
        label: '부드러운 카모마일 & 은은한 블론드 우드',
        subLabel: '피부에 녹아드는 온화하고 포근한 잔향',
        title: 'Option A'
      },
      {
        key: 'pumkini',
        label: '스파이시 진저 & 은밀한 코코넛 밀크',
        subLabel: '중독성 있는 달콤함과 쌉싸래함의 공존',
        title: 'Option B'
      },
      {
        key: 'evening',
        label: '라즈베리 & 묵직한 패출리 장미 앰버',
        subLabel: '고혹적이고 우아한 실루엣을 남기는 향',
        title: 'Option C'
      },
      {
        key: 'metal',
        label: '금속성 알데하이드 & 깔끔한 백머스크',
        subLabel: '정갈하고 모던하며 지적인 차가움',
        title: 'Option D'
      }
    ]
  }
];

export const AURA_PROFILES: Record<ScentKey, AuraAnalysisResult> = {
  chamo: {
    scentKey: 'chamo',
    title: '따스하고 이지적인 목조 아우라 (Warm Wood Aura)',
    warmth: 92,
    elegance: 88,
    coolness: 45,
    description:
      '온화한 미소와 깊이 있는 이목구비. 카모마일과 블론드 우드의 차분한 CHAMO 향이 본연의 따스한 인상을 극대화해 줍니다.'
  },
  pumkini: {
    scentKey: 'pumkini',
    title: '위트 있고 은밀한 반전 아우라 (Sensual Witty Aura)',
    warmth: 85,
    elegance: 74,
    coolness: 60,
    description:
      '매력적인 눈매와 독창적인 분위기. 달콤한 단호박과 스파이시 진저의 PUMKINI 향이 감각적인 개성을 한층 살려줍니다.'
  },
  evening: {
    scentKey: 'evening',
    title: '화려하고 몽환적인 노을빛 아우라 (Sunset Rosy Aura)',
    warmth: 78,
    elegance: 95,
    coolness: 52,
    description:
      '선이 고운 화려함과 로맨틱한 분위기. 라즈베리와 붉은 장미 앰버의 EVENING GLOW 향이 당당하고 우아한 잔상을 완성합니다.'
  },
  metal: {
    scentKey: 'metal',
    title: '맑고 차가운 고요함의 아우라 (Icy Sage Modernity)',
    warmth: 40,
    elegance: 82,
    coolness: 96,
    description:
      '세련되고 지적인 라인과 대리석처럼 정갈한 인상. HOLY METAL의 차가운 금속성과 세이지 향이 명료한 분위기를 더해줍니다.'
  }
};

export const OUTFIT_PROFILES: Record<
  ScentKey,
  AuraAnalysisResult & { stylingTip: string }
> = {
  chamo: {
    scentKey: 'chamo',
    title: '소프트 캐시미어 & 뉴트럴 레이어링 (Soft Cashmere Pairing)',
    warmth: 91,
    elegance: 89,
    coolness: 44,
    description:
      '아이보리·카멜·베이지 등 부드러운 천연 소재와 따뜻한 뉴트럴 톤 코디에 카모마일과 블론드 우드의 포근한 CHAMO가 완벽히 스며듭니다.',
    stylingTip: '울 코트 옷깃이나 캐시미어 니트 안쪽, 손목 맥박 부위에 가볍게 레이어링해 보세요.'
  },
  pumkini: {
    scentKey: 'pumkini',
    title: '위트 있는 컬러 포인트 & 믹스매치 룩 (Eclectic Color-Play)',
    warmth: 83,
    elegance: 79,
    coolness: 58,
    description:
      '테라코타·올리브 그린·데님처럼 감각적인 컬러 대비가 살아있는 룩에 하얀 호박과 진저·코코넛 밀크의 반전 매력 PUMKINI가 입체감을 더해줍니다.',
    stylingTip: '캐주얼한 아우터 소매 끝이나 레더 백 주변에 은은한 잔향 포인트로 추천합니다.'
  },
  evening: {
    scentKey: 'evening',
    title: '로맨틱 실크 & 노을빛 글램 룩 (Sunset Velvet Mood)',
    warmth: 77,
    elegance: 96,
    coolness: 50,
    description:
      '버건디·로즈·딥 플럼 실루엣과 메탈릭 주얼리가 어우러진 드레시한 코디에는 라즈베리와 붉은 장미 앰버의 EVENING GLOW가 가장 고혹적입니다.',
    stylingTip: '저녁 약속이나 포멀한 무드의 드레스·재킷 위 쇄골 라인에 1~2회 분사해 보세요.'
  },
  metal: {
    scentKey: 'metal',
    title: '모던 테일러링 & 모노크롬 미니멀 룩 (Monochrome Architectural)',
    warmth: 38,
    elegance: 86,
    coolness: 95,
    description:
      '블랙 블레이저·화이트 셔츠·슬레이트 그레이·실버 악센트로 완성한 절제된 모노크롬 코디에 HOLY METAL의 차가운 세이지와 알데하이드 잔향이 명료함을 극대화합니다.',
    stylingTip: '정갈한 셔츠 커프스와 손등에 쉘 퍼퓸 핸드 혹은 미스트를 더해 시크한 끝인상을 남겨보세요.'
  }
};

export const COLLECTION_ITEMS: CollectionItem[] = [
  {
    id: 'chamo-egg',
    scentKey: 'chamo',
    visualKey: 'chamo',
    category: 'Signature Egg Perfume',
    name: 'CHAMO',
    koreanName: '카모',
    volume: '14 mL',
    priceKRW: 45800,
    imageUrl: PRODUCT_IMAGES.chamo,
    description:
      '진득한 카모마일의 약초 향과 쌉싸래한 클라리세이지의 허브 향이 오묘한 조화를 이루며, 차가운 이끼의 기운을 따스한 블론드 우드와 부드러운 머스크로 감싸주는 탬버린즈의 대표 시그니처 안식의 향.',
    badgeText: 'Chamomile & Honeyed Sage',
    badgeBg: 'rgba(227, 176, 108, 0.35)',
    bgGrad: 'from-[#E3B06C]/30',
    topNotes: 'Clary Sage, Chamomile',
    middleNotes: 'Water, Cypriol',
    baseNotes: 'Amber, Musk, Blonde Wood'
  },
  {
    id: 'pumkini-classic',
    scentKey: 'pumkini',
    visualKey: 'pumkini',
    category: 'Classic Glass Perfume',
    name: 'PUMKINI',
    koreanName: '펌키니',
    volume: '50 mL',
    priceKRW: 149000,
    imageUrl: PRODUCT_IMAGES.pumkini,
    description:
      '하얀 호박의 청초하고 달콤한 향에 차조기잎과 베르가못의 쌉싸래한 푸르름이 더해집니다. 잘 여문 호박과 진저의 스파이시함에 크리미한 코코넛 밀크가 남기는 은밀하고 오묘한 잔상.',
    badgeText: 'Sweet Pumpkin & Perilla Leaf',
    badgeBg: 'rgba(232, 125, 62, 0.35)',
    bgGrad: 'from-[#E87D3E]/30',
    topNotes: 'Bergamot, Perilla Leaf',
    middleNotes: 'Pumpkin, Ginger',
    baseNotes: 'Coconut Milk, Sandalwood'
  },
  {
    id: 'evening-egg',
    scentKey: 'evening',
    visualKey: 'evening',
    category: 'Rose Tinted Egg Perfume',
    name: 'EVENING GLOW',
    koreanName: '이브닝글로우',
    volume: '14 mL',
    priceKRW: 45800,
    imageUrl: PRODUCT_IMAGES.evening,
    description:
      '모든 장미가 붉은 노을빛으로 물드는 로맨틱한 순간. 신선한 라즈베리와 레몬의 스파클링함에 신비로운 패출리와 머스크 노트가 피어나는 매혹적인 로지 앰버 향.',
    badgeText: 'Sunset Rose & Raspberry',
    badgeBg: 'rgba(201, 78, 107, 0.35)',
    bgGrad: 'from-[#C94E6B]/30',
    topNotes: 'Lemon, Raspberry, Dill',
    middleNotes: 'Rose, Cypriol',
    baseNotes: 'Patchouli, Musk'
  },
  {
    id: 'metal-shell',
    scentKey: 'metal',
    visualKey: 'metal',
    category: 'Sculptural Shell Hand',
    name: 'HOLY METAL',
    koreanName: '홀리메탈',
    volume: '30 mL',
    priceKRW: 32000,
    imageUrl: PRODUCT_IMAGES.metal,
    description:
      '우연히 발길이 닿은 신성한 성전의 차갑고 고요한 공기. 측백나무 잎과 세이지의 깨끗함에 알데하이드 금속성 잔향이 조화를 이루는 손전용 스컬프처 쉘 핸드크림.',
    badgeText: 'Icy Metal & Fresh Sage',
    badgeBg: 'rgba(125, 161, 164, 0.35)',
    bgGrad: 'from-[#7DA1A4]/30',
    topNotes: 'Cypress Leaf, Sage',
    middleNotes: 'Incense, Metallic Aldehyde',
    baseNotes: 'White Musk, Cedarwood'
  },
  {
    id: 'lale-classic',
    visualKey: 'lale',
    category: 'Classic Glass Perfume',
    name: 'LALE',
    koreanName: '라레',
    volume: '50 mL',
    priceKRW: 149000,
    imageUrl: PRODUCT_IMAGES.lale,
    description:
      "'튤립'을 의미하는 이름처럼 새벽이슬을 머금은 한 송이 백튤립과 청사과의 풋풋한 달콤함이 교차하며, 샌달우드가 잔잔하고 무게감 있게 감싸주는 은은한 프루티 플로럴.",
    badgeText: 'Green Apple & White Tulip',
    badgeBg: 'rgba(90, 138, 98, 0.35)',
    bgGrad: 'from-[#5A8A62]/30',
    topNotes: 'Green Apple, Eucalyptus',
    middleNotes: 'White Tulip, Mimosa',
    baseNotes: 'Sandalwood, Leather, Musk'
  },
  {
    id: 'perfume-candle',
    visualKey: 'candle',
    category: 'Sculptural Wax Object',
    name: 'PERFUME CANDLE',
    koreanName: '퍼퓸 캔들',
    volume: '210 g',
    priceKRW: 78000,
    imageUrl: PRODUCT_IMAGES.candle,
    description:
      '공간 전체를 아늑한 향과 아티스틱한 질감으로 채워주는 캔들 컬렉션. 손으로 직접 거친 질감을 빚어낸 석고 미학 용기가 감각적인 오브제 역할을 더합니다.',
    badgeText: 'Warm Wax & Spatial Scent',
    badgeBg: 'rgba(232, 125, 62, 0.25)',
    bgGrad: 'from-[#E87D3E]/20',
    topNotes: 'Soft Soy Wax Blend',
    middleNotes: 'Handcrafted Concrete Vessel',
    baseNotes: 'Approx. 40 hours Burn Time',
    extraMeta: [
      { label: 'Material', value: 'Soft Soy Wax Blend' },
      { label: 'Vessel', value: 'Handcrafted Concrete' },
      { label: 'Burn Time', value: 'Approx. 40 hours' }
    ]
  }
];

export const REVIEW_SCENT_TAGS: ReviewScentTag[] = [
  '데일리',
  '지속력',
  '선물용'
];

export const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-1',
    productId: 'chamo-egg',
    authorName: '서연 *',
    rating: 5,
    scentTag: '데일리 추천',
    comment:
      '처음 뿌렸을 때 올라오는 카모마일 허브 향이 마음을 차분하게 만들어줘요. 시간이 지날수록 블론드 우드와 머스크가 피부에 자연스럽게 스며들어 사계절 내내 데일리로 손이 갑니다. 에그 퍼퓸 케이스도 조약돌처럼 손에 쏙 들어와 휴대하기 좋아요.',
    createdAt: '2026-11-12',
    helpfulCount: 18,
    verifiedPurchase: true
  },
  {
    id: 'rev-2',
    productId: 'pumkini-classic',
    authorName: '민준 *',
    rating: 5,
    scentTag: '유니크한 무드',
    comment:
      '단순히 달콤하기만 한 호박 향이 아니라 첫 향의 차조기잎과 진저의 쌉싸래함이 정말 매력적입니다. 잔향으로 넘어갈 때 코코넛 밀크와 샌달우드가 크리미하게 남아서 흔하지 않은 고급스러운 인상을 남깁니다.',
    createdAt: '2026-11-10',
    helpfulCount: 14,
    verifiedPurchase: true
  },
  {
    id: 'rev-3',
    productId: 'evening-egg',
    authorName: '하은 *',
    rating: 5,
    scentTag: '잔향 지속력 좋음',
    comment:
      '전형적인 파우더리 로즈가 아니라 노을 지는 저녁에 잘 어울리는 세련된 장미 향이에요. 초반 라즈베리의 상큼한 과즙감 뒤에 패출리가 무게감을 잡아주어 저녁 약속에 뿌리면 분위기 있다는 이야기를 꼭 듣습니다.',
    createdAt: '2026-11-08',
    helpfulCount: 11,
    verifiedPurchase: true
  },
  {
    id: 'rev-4',
    productId: 'metal-shell',
    authorName: '지우 *',
    rating: 4,
    scentTag: '선물용 추천',
    comment:
      '핸드크림인데 웬만한 니치 향수만큼 발향과 지속력이 좋습니다. 측백나무 잎의 서늘하고 정갈한 향이 끈적임 없이 산뜻하게 스며들어서 업무 중 기분 전환용이나 지인 선물용으로 매번 재구매하고 있어요.',
    createdAt: '2026-11-05',
    helpfulCount: 9,
    verifiedPurchase: true
  },
  {
    id: 'rev-5',
    productId: 'lale-classic',
    authorName: '유진 *',
    rating: 5,
    scentTag: '계절감 완벽',
    comment:
      '물기 어린 튤립 줄기와 청사과의 풋풋한 생기가 동시에 느껴져 기분이 맑아지는 향입니다. 너무 가볍지 않게 샌달우드가 뒤를 받쳐주어서 깔끔한 셔츠 룩에 완벽하게 어울려요.',
    createdAt: '2026-11-02',
    helpfulCount: 7,
    verifiedPurchase: true
  },
  {
    id: 'rev-6',
    productId: 'perfume-candle',
    authorName: '도현 *',
    rating: 5,
    scentTag: '선물용 추천',
    comment:
      '불을 켜지 않고 선반에 올려두기만 해도 공간에 은은한 발향이 퍼지고 석고 콘크리트 용기의 질감이 인테리어 오브제 역할을 톡톡히 합니다. 집들이 선물로도 최고였어요.',
    createdAt: '2026-10-29',
    helpfulCount: 12,
    verifiedPurchase: true
  }
];

export function formatKRW(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`;
}
