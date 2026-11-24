import React, { useState, useRef, useEffect } from 'react';
import { ScentKey } from '../types.ts';
import {
  AURA_PROFILES,
  OUTFIT_PROFILES,
  SCENT_CONFIGS,
  COLLECTION_ITEMS,
  formatKRW
} from '../data/scents.ts';
import { AURA_PORTRAITS, OUTFIT_PRESET_IMAGES } from '../data/productImages.ts';
import { ProductImage } from './ProductImage.tsx';
import { playChimeAudio } from '../utils/audio.ts';
import { analyzeOutfitImage } from '../utils/outfitAnalyzer.ts';
import {
  Camera,
  Sparkles,
  UploadCloud,
  RefreshCw,
  CheckCircle2,
  ShoppingBag,
  Shirt,
  User,
  Palette
} from 'lucide-react';

interface AiFaceMatcherSectionProps {
  onSelectAndSpray: (key: ScentKey) => void;
  onAddToCart: (productId: string) => void;
  soundEnabled: boolean;
}

type MatcherMode = 'face' | 'outfit';

const PRESET_AVATARS: { name: string; key: ScentKey; label: string; url: string }[] = [
  {
    name: 'Warm & Soft',
    key: 'chamo',
    label: '따스한 미소 & 우디',
    url: AURA_PORTRAITS.chamo
  },
  {
    name: 'Witty & Chic',
    key: 'pumkini',
    label: '매력적인 개성 & 위트',
    url: AURA_PORTRAITS.pumkini
  },
  {
    name: 'Sunset Rose',
    key: 'evening',
    label: '고혹적인 로맨틱 아우라',
    url: AURA_PORTRAITS.evening
  },
  {
    name: 'Icy Sage',
    key: 'metal',
    label: '정갈하고 지적인 쿨톤',
    url: AURA_PORTRAITS.metal
  }
];

const PRESET_OUTFITS: { name: string; key: ScentKey; label: string; url: string }[] = [
  {
    name: 'Soft Cashmere',
    key: 'chamo',
    label: '베이지 · 카멜 니트 & 코트',
    url: OUTFIT_PRESET_IMAGES.chamo
  },
  {
    name: 'Eclectic Spice',
    key: 'pumkini',
    label: '테라코타 · 그린 믹스매치',
    url: OUTFIT_PRESET_IMAGES.pumkini
  },
  {
    name: 'Velvet Sunset',
    key: 'evening',
    label: '버건디 실크 & 플럼 재킷',
    url: OUTFIT_PRESET_IMAGES.evening
  },
  {
    name: 'Monochrome Edge',
    key: 'metal',
    label: '블랙 블레이저 & 슬레이트',
    url: OUTFIT_PRESET_IMAGES.metal
  }
];

export const AiFaceMatcherSection: React.FC<AiFaceMatcherSectionProps> = ({
  onSelectAndSpray,
  onAddToCart,
  soundEnabled
}) => {
  const [mode, setMode] = useState<MatcherMode>('face');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatusText, setScanStatusText] = useState<string>('이미지 분석 준비 중...');
  const [selectedProfileKey, setSelectedProfileKey] = useState<ScentKey | null>(null);
  const [lastHintKey, setLastHintKey] = useState<ScentKey | undefined>(undefined);
  const [outfitPalette, setOutfitPalette] = useState<string[]>([]);
  const [outfitSummary, setOutfitSummary] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [barWarmth, setBarWarmth] = useState<number>(0);
  const [barElegance, setBarElegance] = useState<number>(0);
  const [barCoolness, setBarCoolness] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAnalysis = (src: string, targetKeyHint?: ScentKey, activeMode: MatcherMode = mode) => {
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    setImageSrc(src);
    setIsScanning(true);
    setScanProgress(0);
    setSelectedProfileKey(null);
    setLastHintKey(targetKeyHint);
    setOutfitPalette([]);
    setOutfitSummary('');
    setBarWarmth(0);
    setBarElegance(0);
    setBarCoolness(0);

    const scanTexts =
      activeMode === 'outfit'
        ? [
            '의상 실루엣 & 소재 질감 스캔 중...',
            '코디 주요 컬러 팔레트(HEX) 추출 중...',
            '룩의 온도감 · 대비 · 스타일 무드 계산 중...',
            '코디와 가장 조화로운 탬버린즈 향수 매칭 완료!'
          ]
        : [
            '얼굴 윤곽 & 이목구비 인식 중...',
            '피부 톤 & 아우라 온도감 분석 중...',
            '인상 밸런스 및 분위기 추출 중...',
            '탬버린즈 시그니처 향수 매칭 완료!'
          ];

    // Kick off real pixel color analysis in parallel when in outfit mode
    const outfitPromise =
      activeMode === 'outfit' ? analyzeOutfitImage(src, targetKeyHint) : null;

    let progress = 0;
    scanTimerRef.current = setInterval(() => {
      progress += 4;
      setScanProgress(progress);

      if (progress < 28) {
        setScanStatusText(scanTexts[0]);
      } else if (progress < 58) {
        setScanStatusText(scanTexts[1]);
      } else if (progress < 88) {
        setScanStatusText(scanTexts[2]);
      } else {
        setScanStatusText(scanTexts[3]);
      }

      if (progress >= 100) {
        if (scanTimerRef.current) clearInterval(scanTimerRef.current);

        if (activeMode === 'outfit' && outfitPromise) {
          void outfitPromise.then((res) => {
            setIsScanning(false);
            setSelectedProfileKey(res.scentKey);
            setOutfitPalette(res.palette);
            setOutfitSummary(res.styleSummary);
            playChimeAudio(soundEnabled);

            setTimeout(() => {
              setBarWarmth(res.warmth);
              setBarElegance(res.elegance);
              setBarCoolness(res.coolness);
            }, 80);
          });
        } else {
          setIsScanning(false);
          const keys: ScentKey[] = ['chamo', 'pumkini', 'evening', 'metal'];
          const chosen = targetKeyHint || keys[Math.floor(Math.random() * keys.length)];
          setSelectedProfileKey(chosen);
          playChimeAudio(soundEnabled);

          const profile = AURA_PROFILES[chosen];
          setTimeout(() => {
            setBarWarmth(profile.warmth);
            setBarElegance(profile.elegance);
            setBarCoolness(profile.coolness);
          }, 80);
        }
      }
    }, 50);
  };

  const handleModeSwitch = (nextMode: MatcherMode) => {
    if (nextMode === mode) return;
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    setMode(nextMode);
    setImageSrc(null);
    setIsScanning(false);
    setSelectedProfileKey(null);
    setLastHintKey(undefined);
    setOutfitPalette([]);
    setOutfitSummary('');
    setBarWarmth(0);
    setBarElegance(0);
    setBarCoolness(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        startAnalysis(event.target.result, undefined, mode);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    setImageSrc(null);
    setIsScanning(false);
    setSelectedProfileKey(null);
    setLastHintKey(undefined);
    setOutfitPalette([]);
    setOutfitSummary('');
    setBarWarmth(0);
    setBarElegance(0);
    setBarCoolness(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReanalyzeCurrent = () => {
    if (imageSrc && !isScanning) {
      startAnalysis(imageSrc, mode === 'outfit' ? lastHintKey : undefined, mode);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        startAnalysis(event.target.result, undefined, mode);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    };
  }, []);

  const activeProfile = selectedProfileKey
    ? mode === 'outfit'
      ? OUTFIT_PROFILES[selectedProfileKey]
      : AURA_PROFILES[selectedProfileKey]
    : null;
  const activeOutfitExtra =
    selectedProfileKey && mode === 'outfit' ? OUTFIT_PROFILES[selectedProfileKey] : null;
  const activeScent = selectedProfileKey ? SCENT_CONFIGS[selectedProfileKey] : null;
  const matchedProduct = selectedProfileKey
    ? COLLECTION_ITEMS.find((item) => item.scentKey === selectedProfileKey)
    : undefined;

  const presets = mode === 'outfit' ? PRESET_OUTFITS : PRESET_AVATARS;

  return (
    <section id="ai-face-matcher" className="py-20 min-[601px]:py-24 px-4 min-[601px]:px-6 min-[1025px]:px-4 max-w-[1080px] mx-auto border-t border-black/10">
      <div className="text-center mb-10">
        <span className="text-[11px] min-[601px]:text-xs tracking-[0.22em] text-[#171717]/60 uppercase block mb-2 font-mono">
          Visual Aura &amp; Style Analytics
        </span>
        <h2 className="font-serif text-[26px] min-[601px]:text-4xl min-[1025px]:text-5xl text-[#171717] font-light leading-[1.18] break-keep text-pretty">
          AI Face &amp; Outfit Fragrance Matcher
        </h2>
        <p className="text-[13px] min-[601px]:text-sm text-[#171717]/70 mt-3 max-w-xl mx-auto leading-relaxed break-keep text-pretty">
          얼굴 이미지의 인상 아우라 또는 <strong>오늘 입은 옷 코디 사진의 컬러·소재 무드</strong>를 분석하여{' '}
          스타일링에 가장 완벽하게 어우러지는 탬버린즈 시그니처 향수를 매칭해 드립니다.
        </p>

        {/* Mode Switcher: Face Aura vs Outfit Coordination */}
        <div className="mt-6 inline-flex p-1 rounded-full bg-white/80 border border-black/15 shadow-sm max-w-full">
          <button
            type="button"
            onClick={() => handleModeSwitch('face')}
            className={`px-3 min-[601px]:px-5 py-2 rounded-full text-[11px] min-[601px]:text-xs font-medium transition-all cursor-pointer flex items-center gap-1 min-[601px]:gap-1.5 whitespace-nowrap ${
              mode === 'face'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'text-[#171717]/70 hover:text-[#171717]'
            }`}
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span>AI Face · 인상 아우라</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('outfit')}
            className={`px-3 min-[601px]:px-5 py-2 rounded-full text-[11px] min-[601px]:text-xs font-medium transition-all cursor-pointer flex items-center gap-1 min-[601px]:gap-1.5 whitespace-nowrap ${
              mode === 'outfit'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'text-[#171717]/70 hover:text-[#171717]'
            }`}
          >
            <Shirt className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span>Outfit Look · 옷 코디 매칭</span>
          </button>
        </div>
      </div>

      <div className="glass-card p-5 min-[601px]:p-8 min-[1025px]:p-11 rounded-3xl shadow-lg border border-black/10">
        <div className="grid grid-cols-1 min-[601px]:grid-cols-2 gap-8 items-center">
          {/* Left: Image Upload & Scanner View */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => {
                if (!isScanning) triggerFileInput();
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative w-full h-80 rounded-2xl border-2 border-dashed transition-all overflow-hidden group cursor-pointer flex flex-col items-center justify-center p-4 bg-white/40 ${
                isDragging ? 'border-[#171717] bg-[#EFECE6]' : 'border-black/20 hover:border-black/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              {!imageSrc ? (
                <div className="text-center transition-all group-hover:scale-105 select-none">
                  <div className="w-16 h-16 rounded-full bg-[#171717]/5 flex items-center justify-center mx-auto mb-4 text-[#171717]/70">
                    {mode === 'outfit' ? (
                      <Shirt className="w-7 h-7" />
                    ) : (
                      <Camera className="w-7 h-7" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#171717] mb-1">
                    {mode === 'outfit'
                      ? '오늘의 옷 코디 사진 업로드 또는 드래그'
                      : '얼굴 사진 업로드 또는 드래그'}
                  </p>
                  <p className="text-xs text-[#171717]/55 break-keep">
                    {mode === 'outfit'
                      ? '데일리 룩, 플랫레이, 아우터·니트 코디 컬러를 자동 분석합니다.'
                      : '정면이 잘 보이는 사진을 권장합니다.'}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#171717]/80 bg-white/80 px-3 py-1 rounded-full border border-black/10 font-mono">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{mode === 'outfit' ? '코디 사진 선택' : '클릭하여 사진 선택'}</span>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 w-full h-full bg-black/5 group">
                  <img
                    src={imageSrc}
                    alt={mode === 'outfit' ? 'Outfit Coordination Preview' : 'Face Aura Preview'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-2xl"
                  />

                  {!isScanning && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                      <Camera className="w-7 h-7 mb-1.5 drop-shadow" />
                      <span className="text-xs font-medium tracking-wide">클릭하여 다른 사진으로 변경</span>
                    </div>
                  )}

                  {isScanning && (
                    <>
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_15px_#D4AF37] animate-laser pointer-events-none" />
                      <div className="absolute top-4 left-4 right-4 bg-black/80 backdrop-blur-md text-white text-[11px] font-mono py-1.5 px-3.5 rounded-full flex items-center justify-between shadow-lg">
                        <span>{scanStatusText}</span>
                        <span className="tabular-nums">{scanProgress}%</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {imageSrc && !isScanning && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 w-full">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="px-3 py-1.5 text-xs font-mono tracking-wider bg-white/90 border border-black/20 hover:border-black rounded-full text-[#171717] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Camera className="w-3 h-3 text-[#D4AF37]" />
                  <span>사진 변경</span>
                </button>
                <button
                  type="button"
                  onClick={handleReanalyzeCurrent}
                  className="px-3 py-1.5 text-xs font-mono tracking-wider bg-white/90 border border-black/20 hover:border-black rounded-full text-[#171717] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className="w-3 h-3 text-[#171717]/70" />
                  <span>다시 분석</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetPhoto}
                  className="px-3 py-1.5 text-xs font-mono tracking-wider bg-white/60 border border-black/15 hover:border-black/40 rounded-full text-[#171717]/60 hover:text-[#171717] transition-all cursor-pointer"
                >
                  초기화
                </button>
              </div>
            )}

            {/* Quick Sample Photos for Instant Testing */}
            <div className="w-full mt-4">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#171717]/50 block mb-2 text-center min-[601px]:text-left leading-snug break-keep">
                {mode === 'outfit'
                  ? 'Sample Editorial Outfits (코디 스타일 예시 룩)'
                  : 'Sample Sculptural AI Auras (실존 인물 무관 조형 AI 모델)'}
              </span>
              <div className="grid grid-cols-2 min-[1025px]:grid-cols-4 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => startAnalysis(preset.url, preset.key, mode)}
                    className="group relative h-16 rounded-xl overflow-hidden border border-black/15 hover:border-[#171717] transition-all cursor-pointer focus:outline-none"
                    title={preset.label}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent flex items-end p-1.5">
                      <span className="text-[10px] text-white font-medium w-full text-center leading-tight">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Impression / Style Score & Recommendation Results */}
          <div>
            {!selectedProfileKey ? (
              <div className="text-center md:text-left py-8">
                <h4 className="font-serif text-2xl text-[#171717]/40 mb-2 font-light">
                  {mode === 'outfit' ? 'Outfit Scent Pairing Pending' : 'Aura Analysis Pending'}
                </h4>
                <p className="text-xs text-[#171717]/65 leading-relaxed break-keep">
                  {mode === 'outfit'
                    ? '왼쪽 영역에 오늘 입은 옷 코디 사진이나 OOTD 룩북을 올려보시거나 하단 예시 코디를 눌러보세요. 의상의 컬러 팔레트와 온도감·분위기를 실시간 추출해 코디에 가장 잘 어우러지는 향수를 추천합니다.'
                    : '왼쪽 영역에 사진을 등록하시거나 하단의 샘플 아우라 버튼을 눌러보세요. AI가 당신의 인상 키워드(Warmth, Coolness, Elegance)를 측정하여 본연의 분위기와 어우러지는 향수를 산출해냅니다.'}
                </p>
              </div>
            ) : (
              activeProfile &&
              activeScent && (
                <div className="space-y-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#171717]/60 uppercase mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        {mode === 'outfit'
                          ? 'Outfit Color & Style Analysis'
                          : 'Impression Analysis Score'}
                      </span>
                    </div>
                    {(() => {
                      const parenIdx = activeProfile.title.indexOf('(');
                      const koTitle =
                        parenIdx > -1
                          ? activeProfile.title.slice(0, parenIdx).trim()
                          : activeProfile.title;
                      const enSub =
                        parenIdx > -1 ? activeProfile.title.slice(parenIdx).trim() : '';
                      return (
                        <div>
                          <h4 className="font-serif text-xl min-[601px]:text-2xl text-[#171717] font-medium leading-snug break-keep text-pretty">
                            {koTitle}
                          </h4>
                          {enSub && (
                            <span className="block text-[11px] font-mono text-[#171717]/55 mt-0.5">
                              {enSub}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Extracted Outfit Color Palette Swatches (Outfit Mode) */}
                  {mode === 'outfit' && outfitPalette.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-white/75 border border-black/10 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                        <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-[#171717]/65">
                          <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Detected Outfit Palette</span>
                        </span>
                        <span className="text-[#171717]/65 text-[11px] break-keep">
                          {outfitSummary}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 min-[1025px]:grid-cols-4 gap-2">
                        {outfitPalette.map((hex, idx) => (
                          <div
                            key={`${hex}-${idx}`}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF9F5] border border-black/8"
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                              style={{ backgroundColor: hex }}
                            />
                            <span className="text-[10px] font-mono tabular-nums text-[#171717]/80">
                              {hex}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metrics Bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-[#171717]/70">
                          {mode === 'outfit'
                            ? 'Color Warmth (코디 온도감)'
                            : 'Warmth & Softness (온도감)'}
                        </span>
                        <span className="font-semibold text-[#171717] tabular-nums">
                          {barWarmth || activeProfile.warmth}%
                        </span>
                      </div>
                      <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#E3B06C] h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${barWarmth}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-[#171717]/70">
                          {mode === 'outfit'
                            ? 'Richness & Mood (무드 깊이감)'
                            : 'Elegance & Depth (우아함)'}
                        </span>
                        <span className="font-semibold text-[#171717] tabular-nums">
                          {barElegance || activeProfile.elegance}%
                        </span>
                      </div>
                      <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#C94E6B] h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${barElegance}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-[#171717]/70">
                          {mode === 'outfit'
                            ? 'Modern & Crisp (모던·시크 지수)'
                            : 'Coolness & Crispness (청량감)'}
                        </span>
                        <span className="font-semibold text-[#171717] tabular-nums">
                          {barCoolness || activeProfile.coolness}%
                        </span>
                      </div>
                      <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#7DA1A4] h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${barCoolness}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Perfume Recommendation Summary Card */}
                  <div className="p-4 rounded-2xl bg-white/85 border border-black/10 flex items-center space-x-4 shadow-sm">
                    <div className="w-24 aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0 border border-black/5">
                      <ProductImage
                        visualKey={selectedProfileKey}
                        alt={`${activeScent.name} studio photo`}
                        className="w-full h-full"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[#171717]/50 uppercase">
                        {mode === 'outfit' ? 'Best Outfit Pairing' : 'Best Matched Perfume'}
                      </span>
                      <h5 className="font-serif text-lg min-[601px]:text-xl font-bold text-[#171717] leading-snug break-keep">
                        {activeScent.name}{' '}
                        <span className="inline-block whitespace-nowrap font-sans text-sm font-normal text-[#171717]/70">
                          ({activeScent.koreanName})
                        </span>
                      </h5>
                      {matchedProduct && (
                        <span className="text-xs font-mono tabular-nums text-[#171717]/70 block">
                          {matchedProduct.volume} · {formatKRW(matchedProduct.priceKRW)}
                        </span>
                      )}
                      <p className="text-xs text-[#171717]/75 mt-1 break-keep font-light">
                        {activeProfile.description}
                      </p>
                      {activeOutfitExtra?.stylingTip && (
                        <p className="text-[11px] text-[#171717]/65 mt-1.5 pt-1.5 border-t border-black/8 break-keep">
                          <strong className="font-medium text-[#171717]">Tip:</strong>{' '}
                          {activeOutfitExtra.stylingTip}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {matchedProduct && (
                      <button
                        type="button"
                        onClick={() => onAddToCart(matchedProduct.id)}
                        className="py-3.5 px-4 bg-[#171717] text-white text-xs tracking-wider uppercase rounded-full hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>장바구니 담기</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectAndSpray(selectedProfileKey)}
                      className="py-3.5 px-4 border border-[#171717] text-[#171717] text-xs tracking-wider uppercase rounded-full hover:bg-[#171717] hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>미스트 분사하기</span>
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
