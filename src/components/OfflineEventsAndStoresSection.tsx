/// <reference types="google.maps" />
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';
import {
  OFFLINE_EVENTS,
  BRAND_NOTICES,
  STORE_REGION_PRESETS,
  CURATED_STORE_DIRECTORY
} from '../data/eventsAndNotices.ts';
import { CuratedStoreGuide, MapProviderId } from '../types.ts';
import {
  Calendar,
  MapPin,
  Megaphone,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Clock,
  Star,
  Phone,
  Compass,
  Navigation,
  Pin as PinIcon
} from 'lucide-react';

const MAPS_API_KEY: string =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  (typeof process !== 'undefined' && process.env?.GOOGLE_MAPS_API_KEY) ||
  '';

interface StorePlaceSummary {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  userRatingCount?: number;
  googleMapsURI?: string;
  websiteURI?: string;
  phoneNumber?: string;
  weekdayDescriptions?: string[];
  rawPlace: google.maps.places.Place;
}

const MAP_PROVIDERS: {
  id: MapProviderId;
  label: string;
  shortDesc: string;
  dotColor: string;
}[] = [
  { id: 'google', label: '구글맵', shortDesc: '인앱 실시간 지도', dotColor: '#4285F4' },
  { id: 'kakao', label: '카카오맵', shortDesc: '카카오 길찾기 연결', dotColor: '#FEE500' },
  { id: 'naver', label: '네이버지도', shortDesc: '네이버 지도 연결', dotColor: '#03C75A' }
];

function normalizeTamburinsQuery(rawQuery: string): string {
  const trimmed = rawQuery.trim();
  if (!trimmed) return '탬버린즈 서울 플래그십 스토어';
  return trimmed.toLowerCase().includes('tamburins') || trimmed.includes('탬버린즈')
    ? trimmed
    : `탬버린즈 ${trimmed}`;
}

function buildExternalMapUrl(provider: 'kakao' | 'naver' | 'google', rawQuery: string): string {
  const q = normalizeTamburinsQuery(rawQuery);
  const encoded = encodeURIComponent(q);
  if (provider === 'kakao') {
    return `https://map.kakao.com/link/search/${encoded}`;
  }
  if (provider === 'naver') {
    return `https://map.naver.com/p/search/${encoded}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

function isQuotaError(err: unknown): boolean {
  const msg = String((err as { message?: string; status?: string })?.message || err || '');
  const status = String((err as { status?: string; code?: number })?.status || '');
  const code = (err as { code?: number; status?: number })?.code ?? (err as { status?: number })?.status;
  return (
    code === 429 ||
    status === 'RESOURCE_EXHAUSTED' ||
    status === 'OVER_QUERY_LIMIT' ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('QuotaExceeded') ||
    msg.includes('429')
  );
}

interface StoreMarkerItemProps {
  store: StorePlaceSummary;
  isSelected: boolean;
  onSelect: (store: StorePlaceSummary) => void;
  onCloseInfo: () => void;
}

const StoreMarkerItem: React.FC<StoreMarkerItemProps> = ({
  store,
  isSelected,
  onSelect,
  onCloseInfo
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: store.lat, lng: store.lng }}
        title={store.name}
        onClick={() => onSelect(store)}
      >
        <Pin
          background={isSelected ? '#D4AF37' : '#171717'}
          borderColor={isSelected ? '#171717' : '#D4AF37'}
          glyphColor={isSelected ? '#171717' : '#FFFFFF'}
          scale={isSelected ? 1.22 : 1.0}
        />
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={280}
          onCloseClick={onCloseInfo}
        >
          <div className="p-1 text-[#171717] font-sans">
            <h5 className="font-serif text-sm font-bold leading-snug mb-1">{store.name}</h5>
            {store.address && (
              <p className="text-[11px] text-[#171717]/75 leading-relaxed mb-1.5">
                {store.address}
              </p>
            )}
            {typeof store.rating === 'number' && (
              <div className="flex items-center gap-1 text-[11px] font-mono text-[#171717]/80 mb-1.5 tabular-nums">
                <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                <span>{store.rating.toFixed(1)}</span>
                {typeof store.userRatingCount === 'number' && (
                  <span className="text-[#171717]/50">({store.userRatingCount})</span>
                )}
              </div>
            )}
            {store.weekdayDescriptions && store.weekdayDescriptions.length > 0 && (
              <p className="text-[10px] text-[#171717]/65 mb-2 line-clamp-2">
                {store.weekdayDescriptions[0]}
              </p>
            )}
            {store.googleMapsURI && (
              <a
                href={store.googleMapsURI}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#171717] underline underline-offset-2 hover:text-black"
              >
                <span>Google 지도에서 경로 보기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
};

interface InteractiveGoogleStoreLocatorProps {
  queryRequest: { query: string; nonce: number };
  onResetToSeoul: () => void;
}

const InteractiveGoogleStoreLocator: React.FC<InteractiveGoogleStoreLocatorProps> = ({
  queryRequest,
  onResetToSeoul
}) => {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const coreLib = useMapsLibrary('core');

  const [stores, setStores] = useState<StorePlaceSummary[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastFetchedNonceRef = useRef<number>(-1);

  const runPlaceSearch = useCallback(
    async (rawQuery: string) => {
      if (!placesLib || !coreLib) return;
      const normalizedQuery = normalizeTamburinsQuery(rawQuery);

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const request: google.maps.places.SearchByTextRequest = {
          textQuery: normalizedQuery,
          fields: [
            'id',
            'displayName',
            'formattedAddress',
            'location',
            'rating',
            'userRatingCount',
            'googleMapsURI'
          ],
          language: 'ko',
          maxResultCount: 10
        };

        const { places } = await placesLib.Place.searchByText(request);

        const mapped: StorePlaceSummary[] = (places || [])
          .filter((p) => p.location != null)
          .map((p) => {
            const loc = p.location!;
            const lat = typeof loc.lat === 'function' ? loc.lat() : (loc as unknown as { lat: number }).lat;
            const lng = typeof loc.lng === 'function' ? loc.lng() : (loc as unknown as { lng: number }).lng;
            return {
              id: p.id,
              name: p.displayName || 'TAMBURINS Store',
              address: p.formattedAddress || '',
              lat,
              lng,
              rating: typeof p.rating === 'number' ? p.rating : undefined,
              userRatingCount: typeof p.userRatingCount === 'number' ? p.userRatingCount : undefined,
              googleMapsURI: p.googleMapsURI || undefined,
              rawPlace: p
            };
          });

        setStores(mapped);

        if (mapped.length > 0) {
          const first = mapped[0];
          setSelectedStoreId(first.id);

          if (map) {
            if (mapped.length === 1) {
              map.panTo({ lat: first.lat, lng: first.lng });
              map.setZoom(15);
            } else {
              const bounds = new coreLib.LatLngBounds();
              mapped.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
              map.fitBounds(bounds, 56);
            }
          }
        } else {
          setSelectedStoreId(null);
        }
      } catch (err) {
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          setErrorMessage('Google Maps 일일 조회 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.');
        } else {
          setErrorMessage('매장 위치 정보를 불러오지 못했습니다. 검색어를 변경해 다시 시도해 주세요.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [placesLib, coreLib, map]
  );

  // Run search on initial mount and whenever shared queryRequest updates
  useEffect(() => {
    if (placesLib && coreLib && lastFetchedNonceRef.current !== queryRequest.nonce) {
      lastFetchedNonceRef.current = queryRequest.nonce;
      void runPlaceSearch(queryRequest.query);
    }
  }, [placesLib, coreLib, queryRequest, runPlaceSearch]);

  // Fetch extra opening hours / phone on demand when a store is selected
  const handleSelectStore = useCallback(
    async (store: StorePlaceSummary) => {
      setSelectedStoreId(store.id);
      if (map) {
        map.panTo({ lat: store.lat, lng: store.lng });
        const currentZoom = map.getZoom() ?? 12;
        if (currentZoom < 14) {
          map.setZoom(15);
        }
      }

      if (!store.weekdayDescriptions && !store.phoneNumber) {
        try {
          await store.rawPlace.fetchFields({
            fields: ['regularOpeningHours', 'nationalPhoneNumber', 'websiteURI', 'googleMapsURI']
          });
          setStores((prev) =>
            prev.map((item) =>
              item.id === store.id
                ? {
                    ...item,
                    weekdayDescriptions: item.rawPlace.regularOpeningHours?.weekdayDescriptions || [],
                    phoneNumber: item.rawPlace.nationalPhoneNumber || undefined,
                    websiteURI: item.rawPlace.websiteURI || item.websiteURI,
                    googleMapsURI: item.rawPlace.googleMapsURI || item.googleMapsURI
                  }
                : item
            )
          );
        } catch (err) {
          if (isQuotaError(err)) {
            window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          }
        }
      }
    },
    [map]
  );

  const selectedStore = stores.find((s) => s.id === selectedStoreId) || null;

  return (
    <div className="grid grid-cols-1 min-[601px]:grid-cols-2 min-[1025px]:grid-cols-12 gap-5 min-[601px]:gap-6 items-stretch">
      {/* Left List */}
      <div className="min-[1025px]:col-span-5 flex flex-col bg-white/75 rounded-3xl border border-black/10 p-4 min-[601px]:p-5 shadow-sm max-h-[380px] min-[601px]:max-h-[520px]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/8">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span className="text-xs font-medium text-[#171717] whitespace-nowrap">
              Google 검색 매장 목록
            </span>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-[#171717]/55 whitespace-nowrap">
            {isLoading ? '검색 중...' : `${stores.length}곳`}
          </span>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-3 break-keep">
            {errorMessage}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {isLoading && stores.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#171717]/50 font-mono break-keep">
              Google 지도에서 탬버린즈 매장 위치를 조회하고 있습니다...
            </div>
          ) : stores.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <p className="text-xs text-[#171717]/65 break-keep">
                해당 지역에서 검색된 탬버린즈 매장이 없습니다.
              </p>
              <button
                type="button"
                onClick={onResetToSeoul}
                className="text-xs underline underline-offset-4 text-[#171717] cursor-pointer"
              >
                서울 주요 매장으로 돌아가기
              </button>
            </div>
          ) : (
            stores.map((store) => {
              const active = store.id === selectedStoreId;
              return (
                <div
                  key={store.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => void handleSelectStore(store)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      void handleSelectStore(store);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FAF9F5] border-[#171717] shadow-sm'
                      : 'bg-white/70 border-black/8 hover:border-black/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif text-base font-medium text-[#171717] leading-snug break-keep">
                      {store.name}
                    </h4>
                    {typeof store.rating === 'number' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono tabular-nums text-[#171717]/75 shrink-0">
                        <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                        {store.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {store.address && (
                    <p className="text-xs text-[#171717]/65 mt-1 leading-relaxed break-keep">
                      {store.address}
                    </p>
                  )}

                  {active && (store.phoneNumber || (store.weekdayDescriptions && store.weekdayDescriptions.length > 0)) && (
                    <div className="mt-2.5 pt-2.5 border-t border-black/8 space-y-1 text-[11px] text-[#171717]/70">
                      {store.phoneNumber && (
                        <div className="flex items-center gap-1.5 font-mono tabular-nums">
                          <Phone className="w-3 h-3 text-[#171717]/50" />
                          <span>{store.phoneNumber}</span>
                        </div>
                      )}
                      {store.weekdayDescriptions && store.weekdayDescriptions.length > 0 && (
                        <div className="flex items-start gap-1.5">
                          <Clock className="w-3 h-3 text-[#171717]/50 mt-0.5 shrink-0" />
                          <span className="leading-snug">{store.weekdayDescriptions[0]}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {store.googleMapsURI && (
                    <div className="mt-2.5 flex items-center justify-end">
                      <a
                        href={store.googleMapsURI}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-[#171717]/70 hover:text-[#171717] underline underline-offset-2 whitespace-nowrap"
                      >
                        <span>Google 지도 열기</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {selectedStore && selectedStore.weekdayDescriptions && selectedStore.weekdayDescriptions.length > 1 && (
          <details className="mt-3 pt-3 border-t border-black/8 text-[11px] text-[#171717]/70">
            <summary className="cursor-pointer font-medium text-[#171717] select-none">
              선택 매장 전체 요일별 운영 시간 보기
            </summary>
            <ul className="mt-1.5 space-y-0.5 pl-1 font-mono text-[10px]">
              {selectedStore.weekdayDescriptions.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* Right Interactive Google Map */}
      <div className="min-[1025px]:col-span-7 relative w-full h-[380px] min-[601px]:h-[480px] min-[1025px]:h-[520px] rounded-3xl overflow-hidden border border-black/12 shadow-lg bg-[#EFECE6]">
        <GoogleMap
          mapId="DEMO_MAP_ID"
          defaultCenter={{ lat: 37.5326, lng: 127.0246 }}
          defaultZoom={12}
          gestureHandling="greedy"
          mapTypeControl={false}
          streetViewControl={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
        >
          {stores.map((store) => (
            <StoreMarkerItem
              key={store.id}
              store={store}
              isSelected={store.id === selectedStoreId}
              onSelect={(s) => void handleSelectStore(s)}
              onCloseInfo={() => setSelectedStoreId(null)}
            />
          ))}
        </GoogleMap>
      </div>
    </div>
  );
};

interface KoreanExternalMapLocatorProps {
  provider: 'kakao' | 'naver';
  activePresetId: string;
  activeQuery: string;
  onResetToSeoul: () => void;
  onSwitchProvider: (provider: MapProviderId) => void;
}

const KoreanExternalMapLocator: React.FC<KoreanExternalMapLocatorProps> = ({
  provider,
  activePresetId,
  activeQuery,
  onResetToSeoul,
  onSwitchProvider
}) => {
  const isKakao = provider === 'kakao';
  const providerName = isKakao ? '카카오맵' : '네이버지도';
  const otherProvider: 'kakao' | 'naver' = isKakao ? 'naver' : 'kakao';
  const otherProviderName = isKakao ? '네이버지도' : '카카오맵';

  // Filter curated flagship & store directory strictly from local static catalog (no Google Places data)
  const filteredStores = useMemo<CuratedStoreGuide[]>(() => {
    if (activePresetId) {
      if (activePresetId === 'seoul') {
        return CURATED_STORE_DIRECTORY.filter((s) => s.area.includes('서울'));
      }
      return CURATED_STORE_DIRECTORY.filter((s) => s.regionId === activePresetId);
    }

    const q = activeQuery
      .replace(/탬버린즈|tamburins|플래그십|스토어/gi, '')
      .trim()
      .toLowerCase();
    if (!q) return CURATED_STORE_DIRECTORY;

    const tokens = q.split(/\s+/).filter(Boolean);
    return CURATED_STORE_DIRECTORY.filter((store) => {
      const haystack = [
        store.name,
        store.area,
        store.districtHint,
        store.mapQuery,
        ...store.keywords
      ]
        .join(' ')
        .toLowerCase();
      return tokens.some((token) => haystack.includes(token));
    });
  }, [activePresetId, activeQuery]);

  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);

  // Sync selected store when filtered list or query changes
  useEffect(() => {
    if (filteredStores.length > 0) {
      setSelectedGuideId(filteredStores[0].id);
    } else {
      setSelectedGuideId(null);
    }
  }, [filteredStores]);

  const selectedGuide =
    filteredStores.find((s) => s.id === selectedGuideId) || null;

  const targetQuery = selectedGuide
    ? selectedGuide.mapQuery
    : normalizeTamburinsQuery(activeQuery);

  const primaryExternalUrl = buildExternalMapUrl(provider, targetQuery);
  const secondaryExternalUrl = buildExternalMapUrl(otherProvider, targetQuery);

  return (
    <div className="grid grid-cols-1 min-[601px]:grid-cols-2 min-[1025px]:grid-cols-12 gap-5 min-[601px]:gap-6 items-stretch">
      {/* Left Curated Domestic Store Directory */}
      <div className="min-[1025px]:col-span-5 flex flex-col bg-white/75 rounded-3xl border border-black/10 p-4 min-[601px]:p-5 shadow-sm max-h-[380px] min-[601px]:max-h-[520px]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/8">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/15"
              style={{ backgroundColor: isKakao ? '#FEE500' : '#03C75A' }}
            />
            <span className="text-xs font-medium text-[#171717] whitespace-nowrap">
              {providerName} 매장 가이드
            </span>
          </div>
          <span className="text-[11px] font-mono tabular-nums text-[#171717]/55 whitespace-nowrap">
            {filteredStores.length}곳
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredStores.length === 0 ? (
            <div className="py-10 px-3 text-center space-y-3">
              <p className="text-xs text-[#171717]/70 leading-relaxed break-keep text-pretty">
                주요 스토어 목록에 일치하는 지점이 없어도 입력하신 검색어로{' '}
                <strong className="font-semibold text-[#171717]">{providerName}</strong>에서
                전 매장을 바로 검색할 수 있습니다.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <a
                  href={primaryExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isKakao
                      ? 'bg-[#FEE500] text-[#191919] hover:brightness-95'
                      : 'bg-[#03C75A] text-white hover:brightness-95'
                  }`}
                >
                  <span>&lsquo;{targetQuery}&rsquo; 바로 검색</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={onResetToSeoul}
                  className="text-xs underline underline-offset-4 text-[#171717]/75 hover:text-[#171717] cursor-pointer whitespace-nowrap px-2 py-1"
                >
                  서울 주요 매장 보기
                </button>
              </div>
            </div>
          ) : (
            filteredStores.map((store) => {
              const active = store.id === selectedGuide?.id;
              const storeUrl = buildExternalMapUrl(provider, store.mapQuery);
              return (
                <div
                  key={store.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedGuideId(store.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedGuideId(store.id);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FAF9F5] border-[#171717] shadow-sm'
                      : 'bg-white/70 border-black/8 hover:border-black/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif text-base font-medium text-[#171717] leading-snug break-keep">
                      {store.name}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EFECE6] text-[#171717]/80 border border-black/10 shrink-0 whitespace-nowrap">
                      {store.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#171717]/65 mt-1 leading-relaxed break-keep">
                    {store.districtHint} ({store.area})
                  </p>
                  <div className="mt-2.5 flex items-center justify-end">
                    <a
                      href={storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#171717]/80 hover:text-[#171717] underline underline-offset-2 whitespace-nowrap"
                    >
                      <span>{providerName}에서 열기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Interactive Portal Card for Kakao / Naver Map */}
      <div className="min-[1025px]:col-span-7 relative w-full min-h-[380px] min-[601px]:h-[480px] min-[1025px]:h-[520px] rounded-3xl overflow-hidden border border-black/12 shadow-lg bg-[#F5F2EB] flex flex-col justify-between p-5 min-[601px]:p-7">
        {/* Subtle Architectural Grid Backdrop */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-45"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(23,23,23,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(23,23,23,0.06) 1px, transparent 1px)',
            backgroundSize: '36px 36px'
          }}
        />
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ backgroundColor: isKakao ? '#FEE500' : '#03C75A' }}
        />

        {/* Top Header Badge */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-black/10 shadow-xs">
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
              style={{ backgroundColor: isKakao ? '#FEE500' : '#03C75A' }}
            />
            <span className="text-xs font-semibold text-[#171717] whitespace-nowrap">
              {providerName} 공식 연동
            </span>
          </div>

          <span className="text-[11px] font-mono text-[#171717]/55 whitespace-nowrap">
            {isKakao ? 'KAKAO MAP LINK' : 'NAVER MAP LINK'}
          </span>
        </div>

        {/* Center Selected Store / Search Preview */}
        <div className="relative z-10 my-auto py-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-black/10 p-5 min-[601px]:p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-black/10 shadow-xs"
                style={{
                  backgroundColor: isKakao ? '#FEE500' : '#03C75A',
                  color: isKakao ? '#191919' : '#FFFFFF'
                }}
              >
                <Navigation className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono tracking-[0.18em] uppercase text-[#171717]/50 block">
                  {selectedGuide ? `${selectedGuide.area} · ${selectedGuide.badge}` : 'CUSTOM SEARCH QUERY'}
                </span>
                <h4 className="font-serif text-xl min-[601px]:text-2xl text-[#171717] font-medium leading-snug mt-0.5 break-keep text-pretty">
                  {selectedGuide ? selectedGuide.name : targetQuery}
                </h4>
                <p className="text-xs text-[#171717]/65 mt-1 break-keep">
                  {selectedGuide
                    ? selectedGuide.districtHint
                    : `${providerName}에서 해당 지역 탬버린즈 매장의 실시간 위치와 길찾기를 확인합니다.`}
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col min-[601px]:flex-row gap-2.5">
              <a
                href={primaryExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 min-[601px]:px-5 py-3 rounded-full text-xs min-[601px]:text-sm font-semibold transition-all shadow-sm whitespace-nowrap ${
                  isKakao
                    ? 'bg-[#FEE500] text-[#191919] hover:brightness-95 border border-black/10'
                    : 'bg-[#03C75A] text-white hover:brightness-95'
                }`}
              >
                <span>{providerName}에서 위치 · 길찾기</span>
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>

              <a
                href={secondaryExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-full bg-white text-[#171717] border border-black/15 hover:border-black text-xs font-medium transition-colors whitespace-nowrap"
              >
                <span>{otherProviderName} 보기</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Notice + In-App Google Maps Switch */}
        <div className="relative z-10 flex flex-col min-[601px]:flex-row min-[601px]:items-center justify-between gap-2.5 pt-3 border-t border-black/10 text-[11px] text-[#171717]/65">
          <p className="leading-relaxed break-keep text-pretty">
            외부 지도 보안 정책상 공식 {providerName} 창으로 안전하게 연결됩니다.
          </p>
          <button
            type="button"
            onClick={() => onSwitchProvider('google')}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#171717] underline underline-offset-4 hover:text-black cursor-pointer whitespace-nowrap self-start min-[601px]:self-auto shrink-0"
          >
            <span>화면 내 구글 지도로 보기</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const OfflineEventsAndStoresSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'events' | 'notices'>('all');
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(BRAND_NOTICES[0]?.id ?? null);

  // Shared Store Locator State across Google / Kakao / Naver
  const [mapProvider, setMapProvider] = useState<MapProviderId>('google');
  const [activePresetId, setActivePresetId] = useState<string>('seoul');
  const [searchInput, setSearchInput] = useState<string>('');
  const [queryRequest, setQueryRequest] = useState<{ query: string; nonce: number }>({
    query: STORE_REGION_PRESETS[0].query,
    nonce: 1
  });

  const locatorRef = useRef<HTMLDivElement | null>(null);

  const handleLocateEventVenue = (storeQuery: string) => {
    setActivePresetId('');
    setSearchInput(storeQuery);
    setQueryRequest({ query: storeQuery, nonce: Date.now() });
    if (locatorRef.current) {
      locatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePresetClick = (preset: { id: string; query: string }) => {
    setActivePresetId(preset.id);
    setSearchInput('');
    setQueryRequest({ query: preset.query, nonce: Date.now() });
  };

  const handleResetToSeoul = () => {
    handlePresetClick(STORE_REGION_PRESETS[0]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setActivePresetId('');
    setQueryRequest({ query: searchInput.trim(), nonce: Date.now() });
  };

  return (
    <section
      id="stores-events"
      className="py-20 min-[601px]:py-24 px-4 min-[601px]:px-6 min-[1025px]:px-4 max-w-[1080px] mx-auto border-t border-black/10"
    >
      {/* Editorial Section Header */}
      <div className="flex flex-col min-[601px]:flex-row min-[601px]:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-xs tracking-[0.3em] text-[#171717]/60 uppercase block mb-2 font-mono">
            Exhibitions · Notices · Flagship Stores
          </span>
          <h2 className="font-serif text-3xl min-[601px]:text-4xl min-[1025px]:text-5xl text-[#171717] font-light tracking-tight leading-tight break-keep text-pretty">
            Offline Events &amp; Store Locator
          </h2>
          <p className="text-[13px] min-[601px]:text-sm text-[#171717]/70 mt-3 max-w-2xl leading-relaxed break-keep text-pretty">
            탬버린즈의 최신 오프라인 전시·팝업 행사와 공식 공지사항을 확인하고,
            원하는 지도 서비스를 선택해 가까운 오프라인 매장의 위치를 바로 찾아보세요.
          </p>
        </div>

        {/* Section Filter Tabs */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {(
            [
              { id: 'all', label: '행사 & 공지 전체' },
              { id: 'events', label: '오프라인 전시·행사' },
              { id: 'notices', label: '공지사항' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 min-[601px]:px-4 py-2 rounded-full text-xs border transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#171717] text-white border-[#171717] shadow-sm'
                  : 'bg-white/75 text-[#171717]/75 border-black/15 hover:border-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Part 1: Offline Exhibitions & Pop-Up Events */}
      {(activeTab === 'all' || activeTab === 'events') && (
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-serif text-2xl text-[#171717] font-normal break-keep">
              오프라인 전시 및 팝업 행사
            </h3>
          </div>

          <div className="grid grid-cols-1 min-[601px]:grid-cols-2 gap-6">
            {OFFLINE_EVENTS.map((evt) => (
              <article
                key={evt.id}
                className="glass-card rounded-3xl p-6 min-[601px]:p-7 border border-black/10 flex flex-col justify-between transition-all hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#171717]/55">
                      {evt.category}
                    </span>
                    <span
                      className="text-[11px] font-medium px-2.5 py-0.5 rounded-full text-[#171717] border border-black/10 whitespace-nowrap"
                      style={{ backgroundColor: `${evt.scentColor}26` }}
                    >
                      {evt.status}
                    </span>
                  </div>

                  <h4 className="font-serif text-xl min-[601px]:text-2xl text-[#171717] font-medium leading-snug break-keep text-pretty">
                    {evt.title}
                  </h4>
                  <p className="text-xs text-[#171717]/60 mt-1 break-keep">{evt.subtitle}</p>

                  <p className="text-xs text-[#171717]/80 mt-4 leading-relaxed break-keep text-pretty">
                    {evt.description}
                  </p>

                  <div className="mt-4 p-3.5 rounded-2xl bg-white/70 border border-black/8 space-y-1.5 text-xs text-[#171717]/75">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#171717]/50 shrink-0" />
                      <span className="font-mono text-[11px] tabular-nums">{evt.period}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span className="break-keep">
                        {evt.venueName} ({evt.regionLabel})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-black/8 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-[#171717]/60 break-keep">
                    {evt.highlightNote}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLocateEventVenue(evt.storeSearchQuery)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#171717] text-white text-xs font-medium hover:bg-black transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>매장 위치 보기</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Part 2: Official Notices & Brand Announcements */}
      {(activeTab === 'all' || activeTab === 'notices') && (
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-5">
            <Megaphone className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-serif text-2xl text-[#171717] font-normal break-keep">
              공식 공지사항 (Notices)
            </h3>
          </div>

          <div className="bg-white/75 rounded-3xl border border-black/10 divide-y divide-black/8 overflow-hidden shadow-sm">
            {BRAND_NOTICES.map((notice) => {
              const isOpen = expandedNoticeId === notice.id;
              return (
                <div key={notice.id} className="transition-colors hover:bg-white/60">
                  <button
                    type="button"
                    onClick={() => setExpandedNoticeId(isOpen ? null : notice.id)}
                    aria-expanded={isOpen}
                    className="w-full px-5 min-[601px]:px-6 py-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0">
                      <div className="flex items-center gap-2 shrink-0">
                        {notice.isPinned && (
                          <PinIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                        )}
                        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#EFECE6] text-[#171717]/80 border border-black/10 whitespace-nowrap">
                          {notice.tag}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[#171717] leading-snug break-keep text-pretty">
                        {notice.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono tabular-nums text-[#171717]/50 hidden sm:inline">
                        {notice.date}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#171717]/60" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#171717]/60" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 min-[601px]:px-6 pb-5 pt-1 text-xs text-[#171717]/75 space-y-2 border-t border-black/5 bg-[#FAF9F5]/60">
                      <p className="font-medium text-[#171717] break-keep">{notice.summary}</p>
                      <p className="leading-relaxed break-keep">{notice.details}</p>
                      <span className="block sm:hidden text-[11px] font-mono tabular-nums text-[#171717]/50 pt-1">
                        등록일: {notice.date}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Part 3: Multi-Provider Offline Store Locator (Google / Kakao / Naver) */}
      <div ref={locatorRef} className="scroll-mt-24 pt-4">
        <div className="flex flex-col min-[1025px]:flex-row min-[1025px]:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <h3 className="font-serif text-2xl min-[601px]:text-3xl text-[#171717] font-normal break-keep">
                오프라인 매장 위치 찾기
              </h3>
            </div>
            <p className="text-xs text-[#171717]/65 break-keep text-pretty">
              구글맵·카카오맵·네이버지도 중 원하는 지도 서비스를 선택하여 탬버린즈 매장의 위치와 길찾기를 확인하세요.
            </p>
          </div>

          {/* 3-Provider Map Switcher */}
          <div
            role="tablist"
            aria-label="지도 서비스 선택"
            className="grid grid-cols-3 min-[601px]:inline-grid p-1 rounded-2xl min-[601px]:rounded-full bg-[#EFECE6] border border-black/10 gap-1 w-full min-[601px]:w-auto shrink-0"
          >
            {MAP_PROVIDERS.map((provider) => {
              const active = mapProvider === provider.id;
              return (
                <button
                  key={provider.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMapProvider(provider.id)}
                  className={`flex items-center justify-center gap-1.5 px-2.5 min-[601px]:px-4 py-2 rounded-xl min-[601px]:rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#171717] text-white shadow-sm'
                      : 'text-[#171717]/70 hover:text-[#171717]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0 border border-black/15"
                    style={{ backgroundColor: provider.dotColor }}
                  />
                  <span>{provider.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shared Search & Region Filter Bar */}
        <div className="flex flex-col min-[1025px]:flex-row min-[1025px]:items-center justify-between gap-4 mb-5">
          <div className="flex flex-wrap gap-2">
            {STORE_REGION_PRESETS.map((preset) => {
              const active = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`px-3 min-[601px]:px-3.5 py-1.5 rounded-full text-xs border transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#171717] text-white border-[#171717] shadow-sm'
                      : 'bg-white/80 text-[#171717]/75 border-black/15 hover:border-black'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full min-[1025px]:w-80">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#171717]/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="지역·매장 검색 (예: 성수, 부산)"
                aria-label="오프라인 매장 지역 검색"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-full bg-white/90 border border-black/15 focus:outline-none focus:border-[#171717] text-[#171717] placeholder:text-[#171717]/40"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-[#171717] text-white text-xs font-medium hover:bg-black transition-colors cursor-pointer shrink-0 whitespace-nowrap"
            >
              찾기
            </button>
          </form>
        </div>

        {/* Active Map Provider Panel */}
        {mapProvider === 'google' ? (
          MAPS_API_KEY ? (
            <APIProvider
              apiKey={MAPS_API_KEY}
              libraries={['places', 'marker', 'core']}
              language="ko"
              region="KR"
            >
              <InteractiveGoogleStoreLocator
                queryRequest={queryRequest}
                onResetToSeoul={handleResetToSeoul}
              />
            </APIProvider>
          ) : (
            <div className="rounded-3xl border border-black/10 bg-white/80 p-8 text-center space-y-4 shadow-sm">
              <p className="text-sm font-medium text-[#171717] break-keep">
                Google Maps API 키를 불러오는 중이거나 설정되지 않았습니다.
              </p>
              <p className="text-xs text-[#171717]/65 max-w-md mx-auto leading-relaxed break-keep text-pretty">
                상단에서 카카오맵 또는 네이버지도를 선택하시거나, 아래 버튼을 눌러 공식 Google 지도로 바로 확인하실 수 있습니다.
              </p>
              <a
                href={buildExternalMapUrl('google', queryRequest.query)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#171717] text-white text-xs font-medium hover:bg-black transition-colors whitespace-nowrap"
              >
                <span>Google 지도에서 탬버린즈 검색</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )
        ) : (
          <KoreanExternalMapLocator
            provider={mapProvider}
            activePresetId={activePresetId}
            activeQuery={queryRequest.query}
            onResetToSeoul={handleResetToSeoul}
            onSwitchProvider={setMapProvider}
          />
        )}
      </div>
    </section>
  );
};
