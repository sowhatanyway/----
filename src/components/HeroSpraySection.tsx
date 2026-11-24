import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { ScentKey } from '../types.ts';
import { SCENT_CONFIGS } from '../data/scents.ts';
import { ProductImage } from './ProductImage.tsx';
import { playSprayAudio } from '../utils/audio.ts';

interface HeroSpraySectionProps {
  currentScentKey: ScentKey;
  onSelectScent: (key: ScentKey) => void;
  soundEnabled: boolean;
}

export interface HeroSpraySectionRef {
  sprayAtCenter: () => void;
}

interface ActiveSprayText {
  id: number;
  text: string;
  fontClass: string;
}

class MistParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  colorBase: string;
  life: number;
  maxLife: number;

  constructor(x: number, y: number, colorBase: string) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4.2;
    this.vy = (Math.random() - 0.5) * 4.2 - 1.6;
    this.radius = Math.random() * 32 + 25;
    this.maxRadius = this.radius + Math.random() * 55 + 40;
    this.opacity = Math.random() * 0.6 + 0.35;
    this.colorBase = colorBase;
    this.life = 0;
    this.maxLife = Math.random() * 65 + 50;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.radius += (this.maxRadius - this.radius) * 0.055;
    this.life++;
    this.opacity *= 0.958;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.opacity <= 0.01) return;
    ctx.save();
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    grad.addColorStop(0, `${this.colorBase}${this.opacity})`);
    grad.addColorStop(0.55, `${this.colorBase}${this.opacity * 0.42})`);
    grad.addColorStop(1, `${this.colorBase}0)`);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export const HeroSpraySection = forwardRef<HeroSpraySectionRef, HeroSpraySectionProps>(
  ({ currentScentKey, onSelectScent, soundEnabled }, ref) => {
    const sprayAreaRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const particlesRef = useRef<MistParticle[]>([]);
    const [timecode, setTimecode] = useState<string>('00:00:14:02');
    const [activeSprayText, setActiveSprayText] = useState<ActiveSprayText | null>(null);
    const [revealedScentKey, setRevealedScentKey] = useState<ScentKey | null>(null);
    const textCounterRef = useRef<number>(0);
    const quoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastQuoteIndexRef = useRef<number>(-1);

    const currentScent = SCENT_CONFIGS[currentScentKey];
    const revealedScent = revealedScentKey ? SCENT_CONFIGS[revealedScentKey] : null;

    useEffect(() => {
      const interval = setInterval(() => {
        const now = new Date();
        const ms = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');
        const sec = String(now.getSeconds()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        setTimecode(`00:${min}:${sec}:${ms}`);
      }, 40);
      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      return () => {
        if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);
      };
    }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = sprayAreaRef.current;
      if (!canvas || !container) return;

      const handleResize = () => {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = container.clientWidth * dpr;
        canvas.height = container.clientHeight * dpr;
        canvas.style.width = `${container.clientWidth}px`;
        canvas.style.height = `${container.clientHeight}px`;
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      let animId: number;
      const ctx = canvas.getContext('2d');

      const render = () => {
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);

          const particles = particlesRef.current;
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw(ctx);
            if (p.life >= p.maxLife || p.opacity <= 0.01) {
              particles.splice(i, 1);
            }
          }
        }
        animId = requestAnimationFrame(render);
      };

      animId = requestAnimationFrame(render);

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animId);
      };
    }, []);

    const triggerSprayAtCoord = (x: number, y: number) => {
      const scent = SCENT_CONFIGS[currentScentKey];

      for (let i = 0; i < 38; i++) {
        particlesRef.current.push(new MistParticle(x, y, scent.mistColor));
      }

      playSprayAudio(soundEnabled);

      // Pick a quote different from the previous one when multiple exist
      let nextIdx = Math.floor(Math.random() * scent.quotes.length);
      if (scent.quotes.length > 1 && nextIdx === lastQuoteIndexRef.current) {
        nextIdx = (nextIdx + 1) % scent.quotes.length;
      }
      lastQuoteIndexRef.current = nextIdx;
      const quote = scent.quotes[nextIdx];
      const textId = ++textCounterRef.current;

      // Clear any pending clear timer and replace strictly one active quote so text never overlaps
      if (quoteTimerRef.current) {
        clearTimeout(quoteTimerRef.current);
      }

      setActiveSprayText({
        id: textId,
        text: quote,
        fontClass: scent.fontClass
      });

      quoteTimerRef.current = setTimeout(() => {
        setActiveSprayText((current) => (current?.id === textId ? null : current));
      }, 3400);
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = sprayAreaRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      triggerSprayAtCoord(x, y);
    };

    const handleCircleSelect = (key: ScentKey) => {
      onSelectScent(key);
      setRevealedScentKey(key);
      if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);
      setActiveSprayText(null);
    };

    useImperativeHandle(ref, () => ({
      sprayAtCenter: () => {
        if (!sprayAreaRef.current) return;
        setRevealedScentKey(currentScentKey);
        const width = sprayAreaRef.current.clientWidth;
        const height = sprayAreaRef.current.clientHeight;
        triggerSprayAtCoord(width / 2, height / 2);
      }
    }));

    return (
      <section
        id="hero"
        className="relative pt-24 pb-12 min-[601px]:pt-28 min-[601px]:pb-16 min-[1025px]:min-h-screen px-4 min-[601px]:px-6 flex flex-col justify-center items-center overflow-hidden"
      >
        <div className="w-full max-w-[1080px] mx-auto grid grid-cols-1 min-[601px]:grid-cols-12 gap-6 min-[601px]:gap-7 min-[1025px]:gap-10 items-center">
          {/* 1. Title & Editorial Narrative (Mobile 1st, Tablet/PC Left-Top) */}
          <div className="order-1 min-[601px]:order-none min-[601px]:col-span-6 min-[1025px]:col-span-5 min-[601px]:col-start-1 min-[601px]:row-start-1 min-[601px]:self-end text-center min-[601px]:text-left z-20">
            <p className="text-[11px] min-[601px]:text-xs tracking-[0.22em] text-[#171717]/60 uppercase mb-2 font-mono">
              Interactive Spray Experience
            </p>
            <h1 className="font-serif text-[28px] min-[601px]:text-[34px] min-[1025px]:text-[44px] text-[#171717] font-light tracking-tight leading-[1.18] mb-3 break-keep text-pretty">
              Sensory Mist &amp; Emotional Narrative
            </h1>
            <p className="text-[13px] min-[601px]:text-sm text-[#171717]/75 font-light max-w-xl mx-auto min-[601px]:mx-0 leading-relaxed break-keep text-pretty">
              화면 안쪽을 클릭하면 탬버린즈의 대표 향수가 고유의{' '}
              <strong className="font-medium text-[#171717]">컬러 안개 미스트</strong>로 분사되며,{' '}
              손끝에서 피어나는 감정의 서사가 텍스트와 사운드로 연출됩니다.
            </p>
          </div>

          {/* 2. Photo: Cinematic Film Viewport (Mobile 2nd, Tablet/PC Right Column) */}
          <div className="order-2 min-[601px]:order-none min-[601px]:col-span-6 min-[1025px]:col-span-7 min-[601px]:col-start-7 min-[1025px]:col-start-6 min-[601px]:row-start-1 min-[601px]:row-span-2 self-center w-full">
            <div
              ref={sprayAreaRef}
              onClick={handleCanvasClick}
              className="film-frame relative w-full h-[380px] min-[601px]:h-[450px] min-[1025px]:h-[520px] rounded-2xl cursor-pointer group shadow-xl transition-all duration-500 overflow-hidden"
              title="화면을 클릭하여 컬러 안개 미스트를 분사해보세요"
            >
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full z-10 pointer-events-none"
              />
              <div className="film-grain" />

              {/* Center Stage Split: Photo Top + Dedicated Non-Overlapping Quote Stage Bottom */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20 px-5 pt-10 pb-10 text-center select-none pointer-events-none">
                <div className="w-44 min-[601px]:w-52 min-[1025px]:w-64 aspect-[4/3] relative rounded-xl overflow-hidden shadow-2xl border border-black/10 transition-all duration-700 animate-float bg-[#EAE7DF] shrink-0">
                  <ProductImage
                    visualKey={currentScentKey}
                    alt={`${currentScent.name} studio bottle`}
                    className="w-full h-full"
                  />
                </div>

                {/* Single Non-Overlapping Quote / Prompt Stage */}
                <div className="w-full max-w-md min-h-[70px] flex items-center justify-center">
                  {activeSprayText ? (
                    <div
                      key={activeSprayText.id}
                      className={`spray-quote-stage px-4 py-2.5 rounded-xl bg-[#F5F4EF]/85 backdrop-blur-xs border border-black/8 shadow-sm text-[#171717] text-[13px] min-[601px]:text-[15px] leading-relaxed break-keep ${activeSprayText.fontClass}`}
                    >
                      {activeSprayText.text.split('\n').map((line, idx, arr) => (
                        <React.Fragment key={idx}>
                          {line}
                          {idx < arr.length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-serif italic text-[#171717]/60 tracking-wider">
                      Tap anywhere inside to spray colored mist
                    </p>
                  )}
                </div>
              </div>

              {/* 35mm Film Metadata Borders */}
              <div className="absolute top-3 left-4 right-4 flex justify-between z-20 pointer-events-none opacity-45">
                <span className="text-[10px] font-mono tracking-widest text-[#171717]">
                  TAMBURINS 35MM REEL 04
                </span>
                <span className="text-[10px] font-mono tracking-widest text-[#171717] tabular-nums">
                  {timecode}
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4 flex justify-between z-20 pointer-events-none opacity-45">
                <span className="text-[10px] font-mono tracking-widest text-[#171717]">
                  COLORED MIST INTERACTION
                </span>
                <span className="text-[10px] font-mono tracking-widest text-[#171717] tabular-nums">
                  FPS 60.0
                </span>
              </div>
            </div>
          </div>

          {/* 3. Connected Color-Circle Scent Selector (One Straight Row + Click-to-Reveal) */}
          <div className="order-3 min-[601px]:order-none min-[601px]:col-span-6 min-[1025px]:col-span-5 min-[601px]:col-start-1 min-[601px]:row-start-2 min-[601px]:self-start z-20 flex flex-col items-center min-[601px]:items-start">
            <div
              role="radiogroup"
              aria-label="향수 컬러 선택"
              className="relative inline-flex flex-nowrap items-center gap-5 min-[601px]:gap-6 py-1"
            >
              <span
                aria-hidden="true"
                className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-px bg-black/15 pointer-events-none"
              />
              {(['chamo', 'pumkini', 'evening', 'metal'] as ScentKey[]).map((key) => {
                const item = SCENT_CONFIGS[key];
                const isActive = currentScentKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    aria-label={`${item.name} (${item.koreanName})`}
                    onClick={() => handleCircleSelect(key)}
                    style={{ backgroundColor: item.color }}
                    className={`relative z-10 w-9 h-9 min-[601px]:w-10 min-[601px]:h-10 rounded-full border border-black/15 transition-all duration-200 cursor-pointer shrink-0 ${
                      isActive
                        ? 'ring-2 ring-[#171717] ring-offset-2 ring-offset-[#F5F4EF] scale-110 shadow-md'
                        : 'hover:scale-105 opacity-90 hover:opacity-100 shadow-xs'
                    }`}
                  />
                );
              })}
            </div>

            <div className="mt-4 min-h-[42px] text-center min-[601px]:text-left">
              {revealedScent ? (
                <div className="inline-flex flex-col items-center min-[601px]:items-start gap-0.5">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#171717]">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: revealedScent.color }}
                    />
                    <span className="font-serif tracking-wide">{revealedScent.name}</span>
                    <span className="text-xs text-[#171717]/65 font-sans">
                      ({revealedScent.koreanName})
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[#171717]/55 break-keep">
                    {revealedScent.topNotes} · {revealedScent.baseNotes}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#171717]/55 break-keep">
                  컬러 동그라미를 클릭하면 해당 향수 정보가 표시됩니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }
);
