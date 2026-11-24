import { OfflineEvent, BrandNotice, CuratedStoreGuide } from '../types.ts';

export const OFFLINE_EVENTS: OfflineEvent[] = [
  {
    id: 'evt-seongsu-evening',
    status: '진행 중',
    category: 'FLAGSHIP EXHIBITION',
    title: 'EVENING GLOW : 노을빛 장미의 방',
    subtitle: '성수 플래그십 스토어 아티스틱 인스톨레이션',
    period: '2026.10.15 — 상시 쇼케이스',
    venueName: '탬버린즈 성수 플래그십 스토어',
    regionLabel: '서울 성수',
    storeSearchQuery: '탬버린즈 성수 플래그십 스토어',
    highlightNote: '대형 조형 오브제 감상 & 에그 퍼퓸 전 라인업 시향',
    description:
      '노출 콘크리트와 금속 조형물이 어우러진 성수 플래그십 공간에서 EVENING GLOW와 CHAMO의 입체적인 향기 내러티브를 오감으로 경험할 수 있습니다. 현장 구매 시 시즌 한정 리본 기프트 패키징이 제공됩니다.',
    scentColor: '#C94E6B'
  },
  {
    id: 'evt-dosan-egg',
    status: '상설 전시',
    category: 'HAUS DOSAN 4F SHOWROOM',
    title: 'SCULPTURAL EGG & WAX ARCHIVE',
    subtitle: '하우스 도산 4F 탬버린즈 시그니처 공간',
    period: '연중 상시 운영 (주말 웨이팅 가능)',
    venueName: '하우스 도산 탬버린즈',
    regionLabel: '서울 압구정·도산',
    storeSearchQuery: '탬버린즈 하우스 도산',
    highlightNote: '퍼퓸 캔들 210g & 카모·펌키니 50mL 풀 라인업 체험',
    description:
      '비정형적인 왁스 오브제와 키네틱 인스톨레이션이 공존하는 하우스 도산 4층 스토어입니다. 전문 프래그런스 카운셀러의 1:1 레이어링 컨설팅과 시향 카드 큐레이션을 만나보실 수 있습니다.',
    scentColor: '#E3B06C'
  },
  {
    id: 'evt-hannam-shell',
    status: '진행 중',
    category: 'SENSORY POP-UP ARCHIVE',
    title: 'HOLY METAL & PUMKINI 쉘 체험존',
    subtitle: '한남 플래그십 스토어 감각 아카이브',
    period: '2026.11.01 — 2026.12.31',
    venueName: '탬버린즈 한남 플래그십 스토어',
    regionLabel: '서울 한남',
    storeSearchQuery: '탬버린즈 한남 플래그십 스토어',
    highlightNote: '스컬프처 쉘 퍼퓸 핸드 텍스처 테스트 & 포토존',
    description:
      '신성한 성전의 차가운 정적을 모티브로 한 HOLY METAL 공간 연출과 함께 펌키니·라레 라인업을 한자리에서 체험해 보세요. 쉘 핸드크림 전용 키링 참 증정 프로모션이 진행 중입니다.',
    scentColor: '#7DA1A4'
  },
  {
    id: 'evt-samcheong-hanok',
    status: '사전 예약',
    category: 'PRIVATE SCENT LOUNGE',
    title: '삼청 인센스룸 & 1:1 향기 큐레이션',
    subtitle: '삼청 플래그십 스토어 프라이빗 시향 세션',
    period: '매주 금 · 토 · 일 (회차별 선착순)',
    venueName: '탬버린즈 삼청 플래그십 스토어',
    regionLabel: '서울 삼청',
    storeSearchQuery: '탬버린즈 삼청 플래그십 스토어',
    highlightNote: '고즈넉한 공간 속 프라이빗 퍼퓸 · 캔들 테이스팅',
    description:
      '북촌과 삼청의 정취가 스며든 공간에서 나만의 시그니처 향기와 레이어링 조합을 찾는 프라이빗 세션입니다. 방문 전 매장 운영 시간과 위치를 아래 지도에서 확인해 주세요.',
    scentColor: '#E87D3E'
  }
];

export const BRAND_NOTICES: BrandNotice[] = [
  {
    id: 'notice-1',
    tag: '공지',
    title: '[안내] 오프라인 플래그십 스토어 시향 및 스페셜 기프트 패키징 운영 안내',
    date: '2026.11.15',
    isPinned: true,
    summary: '전국 오프라인 스토어에서 1:1 시향 카드 및 시즌 시그니처 기프트 패키징 서비스를 상시 제공합니다.',
    details:
      '탬버린즈 전 오프라인 플래그십 스토어(성수, 한남, 삼청, 하우스 도산 등)에서는 제품 구매 여부와 관계없이 전문 스태프의 안내 아래 전 향수 라인업 시향이 가능합니다. 에그 퍼퓸 및 50mL 퍼퓸 구매 시 블랙 시그니처 쇼핑백과 시향 페이퍼 세트를 기본 동봉해 드립니다.'
  },
  {
    id: 'notice-2',
    tag: '스토어',
    title: '[스토어] 동절기·연말 시즌 오프라인 매장 방문 및 웨이팅 시스템 안내',
    date: '2026.11.10',
    isPinned: true,
    summary: '주말 및 공휴일 오후 2시~6시 사이 플래그십 스토어 입장 대기(현장 등록)가 발생할 수 있습니다.',
    details:
      '쾌적한 전시 감상과 시향 경험을 위해 동시간대 입장 인원을 탄력적으로 운영하고 있습니다. 방문 전 아래 오프라인 매장 위치 찾기 지도에서 각 매장의 실시간 영업 여부 및 운영 시간을 미리 확인하시기 바랍니다.'
  },
  {
    id: 'notice-3',
    tag: '전시',
    title: '[행사] 한남 플래그십 PUMKINI · HOLY METAL 아카이브 프로모션 안내',
    date: '2026.11.01',
    summary: '쉘 퍼퓸 핸드 포함 7만 원 이상 구매 고객 대상 미니 스컬프처 참 기프트 한정 수량 증정.',
    details:
      '본 프로모션은 준비된 수량 소진 시 별도 공지 없이 조기 종료될 수 있으며, 온라인 스토어와 오프라인 플래그십 스토어 간 증정품 재고가 상이할 수 있습니다.'
  },
  {
    id: 'notice-4',
    tag: '배송',
    title: '[배송] 5만 원 이상 무료배송 및 유리 용기 안전 포장 강화 안내',
    date: '2026.10.24',
    summary: '퍼퓸 50mL 및 퍼퓸 캔들 제품 주문 시 2중 완충 전용 박스로 출고됩니다.',
    details:
      '주문 결제 완료 후 영업일 기준 1~2일 이내 순차 출고되며, 50,000원 이상 구매 시 배송비 3,000원이 자동 면제됩니다. 주문 내역은 우측 상단 쇼핑백 드로어 내 [주문 내역] 탭에서 실시간으로 확인하실 수 있습니다.'
  }
];

export const STORE_REGION_PRESETS: { id: string; label: string; query: string }[] = [
  { id: 'seoul', label: '서울 주요 매장', query: '탬버린즈 서울 플래그십 스토어' },
  { id: 'seongsu-dosan', label: '성수 · 도산 · 신사', query: '탬버린즈 성수 도산' },
  { id: 'hannam-samcheong', label: '한남 · 삼청 · 여의도', query: '탬버린즈 한남 삼청' },
  { id: 'busan-nationwide', label: '부산 · 경기 · 백화점', query: '탬버린즈 백화점 매장 대한민국' },
  { id: 'global', label: '도쿄 · 글로벌', query: 'TAMBURINS Tokyo store' }
];

export const CURATED_STORE_DIRECTORY: CuratedStoreGuide[] = [
  {
    id: 'store-seongsu',
    regionId: 'seongsu-dosan',
    name: '탬버린즈 성수 플래그십 스토어',
    badge: '플래그십',
    area: '서울 성수',
    districtHint: '서울 성동구 연무장5길 일대',
    mapQuery: '탬버린즈 성수 플래그십 스토어',
    keywords: ['서울', '성수', '성동', '플래그십', 'seoul', 'seongsu']
  },
  {
    id: 'store-dosan',
    regionId: 'seongsu-dosan',
    name: '탬버린즈 하우스 도산',
    badge: '쇼룸',
    area: '서울 압구정·도산',
    districtHint: '서울 강남구 압구정로46길 일대',
    mapQuery: '탬버린즈 하우스 도산',
    keywords: ['서울', '도산', '하우스도산', '압구정', '청담', '강남', 'seoul', 'dosan']
  },
  {
    id: 'store-sinsa',
    regionId: 'seongsu-dosan',
    name: '탬버린즈 신사 플래그십 스토어',
    badge: '플래그십',
    area: '서울 신사·가로수길',
    districtHint: '서울 강남구 압구정로10길 일대',
    mapQuery: '탬버린즈 신사 플래그십 스토어',
    keywords: ['서울', '신사', '가로수길', '강남', 'seoul', 'sinsa']
  },
  {
    id: 'store-hannam',
    regionId: 'hannam-samcheong',
    name: '탬버린즈 한남 플래그십 스토어',
    badge: '플래그십',
    area: '서울 한남',
    districtHint: '서울 용산구 이태원로 일대',
    mapQuery: '탬버린즈 한남 플래그십 스토어',
    keywords: ['서울', '한남', '이태원', '용산', '플래그십', 'seoul', 'hannam']
  },
  {
    id: 'store-samcheong',
    regionId: 'hannam-samcheong',
    name: '탬버린즈 삼청 플래그십 스토어',
    badge: '플래그십',
    area: '서울 삼청·북촌',
    districtHint: '서울 종로구 삼청로 일대',
    mapQuery: '탬버린즈 삼청 플래그십 스토어',
    keywords: ['서울', '삼청', '북촌', '종로', '안국', '플래그십', 'seoul', 'samcheong']
  },
  {
    id: 'store-yeouido',
    regionId: 'hannam-samcheong',
    name: '탬버린즈 더현대 서울',
    badge: '백화점',
    area: '서울 여의도',
    districtHint: '서울 영등포구 여의대로 일대',
    mapQuery: '탬버린즈 더현대 서울',
    keywords: ['서울', '여의도', '더현대', '영등포', '백화점', 'seoul']
  },
  {
    id: 'store-seoul-gangnam',
    regionId: 'busan-nationwide',
    name: '탬버린즈 신세계백화점 강남점',
    badge: '백화점',
    area: '서울 반포·고속터미널',
    districtHint: '서울 서초구 신반포로 일대',
    mapQuery: '탬버린즈 신세계 강남',
    keywords: ['서울', '강남', '반포', '신세계', '백화점']
  },
  {
    id: 'store-pangyo',
    regionId: 'busan-nationwide',
    name: '탬버린즈 현대백화점 판교점',
    badge: '백화점',
    area: '경기 성남·판교',
    districtHint: '경기 성남시 분당구 판교역로 일대',
    mapQuery: '탬버린즈 현대백화점 판교',
    keywords: ['경기', '성남', '분당', '판교', '현대백화점', '백화점']
  },
  {
    id: 'store-busan-centum',
    regionId: 'busan-nationwide',
    name: '탬버린즈 신세계 센텀시티',
    badge: '백화점',
    area: '부산 해운대·센텀',
    districtHint: '부산 해운대구 센텀남대로 일대',
    mapQuery: '탬버린즈 신세계 센텀시티 부산',
    keywords: ['부산', '해운대', '센텀', '신세계', '백화점', 'busan']
  },
  {
    id: 'store-tokyo-aoyama',
    regionId: 'global',
    name: 'TAMBURINS 도쿄 아오야마 플래그십',
    badge: '글로벌',
    area: '일본 도쿄 아오야마',
    districtHint: 'Minami-Aoyama, Minato-ku, Tokyo',
    mapQuery: 'TAMBURINS Tokyo Aoyama',
    keywords: ['도쿄', '아오야마', '일본', '글로벌', 'tokyo', 'aoyama']
  }
];

