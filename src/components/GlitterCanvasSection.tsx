import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ScentKey } from '../types.ts';
import { SCENT_CONFIGS } from '../data/scents.ts';
import { PRODUCT_IMAGES, SPANGLE_MOTIF_IMAGES } from '../data/productImages.ts';
import { playGlitterMoodAudio } from '../utils/audio.ts';
import { Sparkles, Music } from 'lucide-react';

interface GlitterCanvasSectionProps {
  currentScentKey: ScentKey;
  soundEnabled: boolean;
}

const MOOD_SOUND_DESCRIPTIONS: Record<ScentKey, { label: string; soundDesc: string; icon: string }> = {
  chamo: {
    label: 'Chamo Gold',
    soundDesc: '따스한 허브 우디 & 골든 펜타토닉 벨 (Golden Amber Chimes)',
    icon: '✨'
  },
  pumkini: {
    label: 'Pumpkin Crimson',
    soundDesc: '위트 있는 달콤 팝 & 스파클링 스타카토 (Sweet Bubble Pop)',
    icon: '🎃'
  },
  evening: {
    label: 'Sunset Rose',
    soundDesc: '몽환적인 황혼 로즈 하프 & 글래스 코러스 (Romantic Rose Harp)',
    icon: '🌹'
  },
  metal: {
    label: 'Ice Silver',
    soundDesc: '맑고 차가운 순은 메탈릭 팅 & 아이스 크리스탈 (Icy Silver Crystal)',
    icon: '❄️'
  }
};

class GlitterStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
  decay: number;

  constructor(x: number, y: number, colors: string[], isBurst = false) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = isBurst ? Math.random() * 4.4 + 1.1 : Math.random() * 1.5 + 0.35;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - (isBurst ? 0.9 : 0.4);
    this.size = Math.random() * 8 + 3.5;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = (Math.random() - 0.5) * 0.12;
    this.alpha = 1;
    this.decay = Math.random() * 0.018 + 0.011;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.985;
    this.vy *= 0.985;
    this.rotation += this.vRot;
    this.alpha -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 9;

    ctx.beginPath();
    const s = this.size;
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(0, 0, s, 0);
    ctx.quadraticCurveTo(0, 0, 0, s);
    ctx.quadraticCurveTo(0, 0, -s, 0);
    ctx.quadraticCurveTo(0, 0, 0, -s);
    ctx.fill();

    ctx.restore();
  }
}

class ScentSpangle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rimColor: string;
  accentColor: string;
  rotation: number;
  vRot: number;
  flipPhase: number;
  vFlip: number;
  flutterPhase: number;
  flutterSpeed: number;
  alpha: number;
  decay: number;
  shape: 'circle' | 'octagon';
  img: HTMLImageElement;
  cropInset: number;

  constructor(
    x: number,
    y: number,
    colors: string[],
    img: HTMLImageElement,
    isMotif: boolean,
    isBurst = false
  ) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = isBurst ? Math.random() * 4.2 + 1.4 : Math.random() * 1.35 + 0.45;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - (isBurst ? 1.8 : 0.7);
    this.radius = isBurst ? Math.random() * 10 + 17 : Math.random() * 7 + 13;
    this.rimColor = colors[0] || '#D4AF37';
    this.accentColor = colors[1] || '#FFFFFF';
    this.rotation = (Math.random() - 0.5) * 0.6;
    this.vRot = (Math.random() - 0.5) * 0.035;
    // Start face-forward-ish so user sees the scent image immediately
    this.flipPhase = (Math.random() - 0.5) * 0.7;
    this.vFlip = (Math.random() * 0.045 + 0.04) * (Math.random() > 0.5 ? 1 : -1);
    this.flutterPhase = Math.random() * Math.PI * 2;
    this.flutterSpeed = Math.random() * 0.07 + 0.05;
    this.alpha = 1;
    this.decay = isBurst ? Math.random() * 0.0035 + 0.0055 : Math.random() * 0.004 + 0.0075;
    this.shape = Math.random() > 0.35 ? 'circle' : 'octagon';
    this.img = img;
    // Motif images are pre-framed inside circular medallions, so slightly zoom in to avoid white corners
    this.cropInset = isMotif ? 0.09 : 0.02;
  }

  update() {
    this.flutterPhase += this.flutterSpeed;
    this.x += this.vx + Math.sin(this.flutterPhase) * 0.35;
    this.y += this.vy;
    this.vx *= 0.985;
    this.vy = this.vy * 0.985 + 0.038; // Gentle sequin flutter & gravity
    this.rotation += this.vRot;
    this.flipPhase += this.vFlip;
    this.alpha -= this.decay;
  }

  private buildShapePath(ctx: CanvasRenderingContext2D, r: number) {
    ctx.beginPath();
    if (this.shape === 'circle') {
      ctx.arc(0, 0, r, 0, Math.PI * 2);
    } else {
      const sides = 8;
      for (let i = 0; i < sides; i++) {
        const a = (i * Math.PI * 2) / sides + Math.PI / 8;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha <= 0) return;
    if (!this.img || !this.img.complete || this.img.naturalWidth === 0) return;

    const rawCos = Math.cos(this.flipPhase);
    const flipScale = Math.abs(rawCos) < 0.09 ? (rawCos >= 0 ? 0.09 : -0.09) : rawCos;
    const isFront = rawCos >= 0;
    const r = this.radius;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(flipScale, 1);
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha * 1.15));

    // Drop glow behind spangle
    ctx.save();
    ctx.shadowColor = this.rimColor;
    ctx.shadowBlur = 12;
    this.buildShapePath(ctx, r);
    ctx.fillStyle = '#FAF9F5';
    ctx.fill();
    ctx.restore();

    // Clip to spangle silhouette
    ctx.save();
    this.buildShapePath(ctx, r);
    ctx.clip();

    const iw = this.img.naturalWidth;
    const ih = this.img.naturalHeight;
    const insetX = iw * this.cropInset;
    const insetY = ih * this.cropInset;
    const sx = insetX;
    const sy = insetY;
    const sw = iw - insetX * 2;
    const sh = ih - insetY * 2;

    if (isFront) {
      ctx.drawImage(this.img, sx, sy, sw, sh, -r, -r, r * 2, r * 2);
    } else {
      // Metallic holographic reverse face of the spangle
      const backGrad = ctx.createLinearGradient(-r, -r, r, r);
      backGrad.addColorStop(0, this.accentColor);
      backGrad.addColorStop(0.5, '#FFFFFF');
      backGrad.addColorStop(1, this.rimColor);
      ctx.fillStyle = backGrad;
      ctx.fillRect(-r, -r, r * 2, r * 2);

      ctx.save();
      ctx.globalAlpha *= 0.42;
      ctx.drawImage(this.img, sx, sy, sw, sh, -r, -r, r * 2, r * 2);
      ctx.restore();
    }

    // Sweeping specular sheen highlight like a glossy tilted sequin
    const sheenPos = Math.sin(this.flipPhase) * r * 1.2;
    const sheenGrad = ctx.createLinearGradient(sheenPos - r * 0.7, -r, sheenPos + r * 0.7, r);
    sheenGrad.addColorStop(0, 'rgba(255,255,255,0)');
    sheenGrad.addColorStop(0.45, 'rgba(255,255,255,0.42)');
    sheenGrad.addColorStop(0.5, 'rgba(255,255,255,0.68)');
    sheenGrad.addColorStop(0.55, 'rgba(255,255,255,0.42)');
    sheenGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(-r, -r, r * 2, r * 2);

    ctx.restore();

    // Metallic bevel rim
    this.buildShapePath(ctx, r);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = this.rimColor;
    ctx.stroke();

    // Inner hairline highlight ring for couture sequin edge
    this.buildShapePath(ctx, Math.max(2, r - 1.6));
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.stroke();

    // Tiny punched sequin pinhole / catchlight at top
    ctx.beginPath();
    ctx.arc(0, -r * 0.68, 1.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fill();

    ctx.restore();
  }
}

interface ScentImagePair {
  motif: HTMLImageElement;
  product: HTMLImageElement;
}

export const GlitterCanvasSection: React.FC<GlitterCanvasSectionProps> = ({
  currentScentKey,
  soundEnabled
}) => {
  const [selectedPaletteKey, setSelectedPaletteKey] = useState<ScentKey>(currentScentKey);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<GlitterStar[]>([]);
  const spanglesRef = useRef<ScentSpangle[]>([]);
  const lastMicroAudioRef = useRef<number>(0);
  const lastMoveSpangleRef = useRef<number>(0);
  const loadedImagesRef = useRef<Partial<Record<ScentKey, ScentImagePair>>>({});

  // Preload motif & studio product images for all 4 scents
  useEffect(() => {
    const keys: ScentKey[] = ['chamo', 'pumkini', 'evening', 'metal'];
    keys.forEach((key) => {
      const motifImg = new Image();
      motifImg.referrerPolicy = 'no-referrer';
      motifImg.src = SPANGLE_MOTIF_IMAGES[key];

      const productImg = new Image();
      productImg.referrerPolicy = 'no-referrer';
      productImg.src = PRODUCT_IMAGES[key];

      loadedImagesRef.current[key] = {
        motif: motifImg,
        product: productImg
      };
    });
  }, []);

  // Update palette if main scent changes
  useEffect(() => {
    setSelectedPaletteKey(currentScentKey);
  }, [currentScentKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
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
          if (p.alpha <= 0) {
            particles.splice(i, 1);
          }
        }

        const spangles = spanglesRef.current;
        for (let i = spangles.length - 1; i >= 0; i--) {
          const sp = spangles[i];
          sp.update();
          sp.draw(ctx);
          if (sp.alpha <= 0) {
            spangles.splice(i, 1);
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

  const emitBurstAt = useCallback((x: number, y: number, key: ScentKey, spangleCount = 9, starCount = 34) => {
    const colors = SCENT_CONFIGS[key].glitterColors;
    const pair = loadedImagesRef.current[key];

    for (let i = 0; i < starCount; i++) {
      particlesRef.current.push(new GlitterStar(x, y, colors, true));
    }

    if (pair) {
      for (let i = 0; i < spangleCount; i++) {
        const useMotif = i % 3 !== 0; // Mix botanical mood motif & studio product bottle
        const img = useMotif ? pair.motif : pair.product;
        spanglesRef.current.push(new ScentSpangle(x, y, colors, img, useMotif, true));
      }
    }

    if (particlesRef.current.length > 260) {
      particlesRef.current.splice(0, particlesRef.current.length - 260);
    }
    if (spanglesRef.current.length > 65) {
      spanglesRef.current.splice(0, spanglesRef.current.length - 65);
    }
  }, []);

  const currentColors = SCENT_CONFIGS[selectedPaletteKey].glitterColors;

  const handlePaletteSelect = (key: ScentKey) => {
    setSelectedPaletteKey(key);
    playGlitterMoodAudio(key, soundEnabled, 'burst');

    // Emit celebratory showcase burst in center of canvas
    const container = containerRef.current;
    if (container) {
      emitBurstAt(container.clientWidth / 2, container.clientHeight * 0.46, key, 10, 30);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < 3; i++) {
      particlesRef.current.push(new GlitterStar(x, y, currentColors, false));
    }
    if (particlesRef.current.length > 260) {
      particlesRef.current.splice(0, particlesRef.current.length - 260);
    }

    const now = Date.now();
    // Emit trailing scent spangles gracefully every ~150ms
    if (now - lastMoveSpangleRef.current > 150) {
      lastMoveSpangleRef.current = now;
      const pair = loadedImagesRef.current[selectedPaletteKey];
      if (pair) {
        const useMotif = Math.random() > 0.32;
        const img = useMotif ? pair.motif : pair.product;
        spanglesRef.current.push(
          new ScentSpangle(x, y, currentColors, img, useMotif, false)
        );
        if (spanglesRef.current.length > 65) {
          spanglesRef.current.splice(0, spanglesRef.current.length - 65);
        }
      }
    }

    // Subtle, gentle micro-sparkle sound throttled
    if (now - lastMicroAudioRef.current > 140) {
      lastMicroAudioRef.current = now;
      playGlitterMoodAudio(selectedPaletteKey, soundEnabled, 'micro');
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    emitBurstAt(x, y, selectedPaletteKey, 10, 38);
    // Play rich distinctive burst audio for the selected mood
    playGlitterMoodAudio(selectedPaletteKey, soundEnabled, 'burst');
  };

  const activeMoodInfo = MOOD_SOUND_DESCRIPTIONS[selectedPaletteKey];

  return (
    <section
      id="glitter"
      className="relative py-20 min-[601px]:py-24 px-4 min-[601px]:px-6 min-[1025px]:px-4 flex flex-col justify-center items-center bg-[#F5F4EF] border-t border-black/10 overflow-hidden"
    >
      <div className="z-20 text-center max-w-[1080px] w-full mx-auto mb-8 select-none">
        <span className="text-[11px] min-[601px]:text-xs tracking-[0.3em] min-[601px]:tracking-[0.4em] text-[#171717]/60 uppercase block mb-2 font-mono">
          Interactive Sparkle Canvas
        </span>
        <h2 className="font-serif text-3xl min-[601px]:text-4xl min-[1025px]:text-5xl text-[#171717] font-light tracking-tight leading-tight mb-4 break-keep text-pretty">
          Olfactory Twinkle &amp; Glitter
        </h2>
        <p className="text-[13px] min-[601px]:text-sm text-[#171717]/70 max-w-2xl mx-auto leading-relaxed font-light break-keep text-pretty">
          마우스를 가볍게 움직이거나 화면을 클릭해 보세요.{' '}
          <br className="hidden min-[601px]:inline" />
          각 향수의 고유한 무드에 맞춰 <strong>글리터 별빛과 향기 모티프·오브제 스팽글, 시그니처 사운드</strong>가 실시간으로 피어납니다.
        </p>

        {/* Glitter Mood Controls */}
        <div className="flex flex-wrap justify-center gap-2 min-[601px]:gap-3 mt-6">
          {(['chamo', 'pumkini', 'evening', 'metal'] as ScentKey[]).map((key) => {
            const isSelected = selectedPaletteKey === key;
            const mood = MOOD_SOUND_DESCRIPTIONS[key];
            return (
              <button
                key={key}
                onClick={() => handlePaletteSelect(key)}
                className={`px-3.5 min-[601px]:px-4 py-1.5 text-xs rounded-full border transition-all font-medium cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#171717] text-white border-[#171717] shadow-md scale-105'
                    : 'border-black/20 hover:border-black bg-white/80 text-[#171717]'
                }`}
              >
                <span>{mood.icon}</span>
                <span>{mood.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mood Sound Indicator Badge */}
        <div className="mt-3.5 inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl min-[601px]:rounded-full bg-white/80 border border-black/10 shadow-xs font-mono text-[11px] text-[#171717]/75 max-w-full leading-snug break-keep">
          <Music className="w-3 h-3 text-[#D4AF37] shrink-0" />
          <span>{activeMoodInfo.soundDesc}</span>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="relative w-full max-w-[1080px] h-[360px] min-[601px]:h-[450px] min-[1025px]:h-[520px] rounded-3xl bg-[#FAF9F5] border border-black/10 shadow-2xl overflow-hidden cursor-crosshair"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none text-center flex flex-col items-center gap-1 w-[90%] min-[601px]:w-auto">
          <span className="text-[10px] min-[601px]:text-[11px] font-mono tracking-wider min-[601px]:tracking-widest text-[#171717]/65 uppercase bg-white/85 px-3.5 min-[601px]:px-4 py-1.5 rounded-full border border-black/10 shadow-sm backdrop-blur-sm inline-flex items-center justify-center gap-1.5 leading-snug break-keep min-[601px]:whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-[#D4AF37] shrink-0" />
            <span>[ Move for Glitter &amp; Spangles · Click for Scent Burst ]</span>
          </span>
        </div>
      </div>
    </section>
  );
};
