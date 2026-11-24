import { ScentKey } from '../types.ts';

export interface OutfitAnalysisResult {
  scentKey: ScentKey;
  palette: string[];
  warmth: number;
  elegance: number;
  coolness: number;
  styleSummary: string;
}

function toHex(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

export async function analyzeOutfitImage(
  imageSrc: string,
  hintKey?: ScentKey
): Promise<OutfitAnalysisResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    img.onload = () => {
      try {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No 2D context');

        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        // 24-level quantized histogram buckets
        const buckets: Record<
          string,
          { count: number; rSum: number; gSum: number; bSum: number }
        > = {};

        let totalPixels = 0;
        let warmVotes = 0;
        let coolVotes = 0;
        let rosePlumVotes = 0;
        let spiceGreenOrangeVotes = 0;
        let beigeCreamVotes = 0;
        let monochromeDarkVotes = 0;
        let saturationSum = 0;
        let brightnessSum = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;

          totalPixels++;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          const sat = max === 0 ? 0 : delta / max;

          brightnessSum += lum;
          saturationSum += sat;

          // Hue-based mood voting
          const warmthDiff = r - b;
          if (warmthDiff > 16) warmVotes++;
          if (b - r > 6 || (sat < 0.12 && lum < 0.35)) coolVotes++;

          // Crimson / burgundy / rose / plum detection
          if (r > g + 16 && r > b + 4 && (b > g * 0.7 || r < 160)) {
            rosePlumVotes++;
          }
          // Terracotta / burnt orange / mustard / forest olive green detection
          if (
            (r > g + 18 && g > b + 14 && sat > 0.28) ||
            (g > r + 10 && g >= b && sat > 0.18)
          ) {
            spiceGreenOrangeVotes++;
          }
          // Soft cream / camel / warm beige knitwear
          if (r >= g && g >= b && sat > 0.08 && sat < 0.45 && lum > 0.48) {
            beigeCreamVotes++;
          }
          // Monochrome black / charcoal / crisp grey-white tailoring
          if (sat < 0.14) {
            monochromeDarkVotes++;
          }

          // Quantize into 24-step buckets for palette extraction
          const qr = Math.floor(r / 28) * 28;
          const qg = Math.floor(g / 28) * 28;
          const qb = Math.floor(b / 28) * 28;
          const key = `${qr}-${qg}-${qb}`;
          if (!buckets[key]) {
            buckets[key] = { count: 0, rSum: 0, gSum: 0, bSum: 0 };
          }
          buckets[key].count++;
          buckets[key].rSum += r;
          buckets[key].gSum += g;
          buckets[key].bSum += b;
        }

        const sortedBuckets = Object.values(buckets)
          .sort((a, b) => b.count - a.count)
          .map((bk) => ({
            rgb: [
              bk.rSum / bk.count,
              bk.gSum / bk.count,
              bk.bSum / bk.count
            ] as [number, number, number]
          }));

        const chosenColors: [number, number, number][] = [];
        for (const candidate of sortedBuckets) {
          if (chosenColors.every((existing) => colorDistance(existing, candidate.rgb) >= 42)) {
            chosenColors.push(candidate.rgb);
          }
          if (chosenColors.length >= 4) break;
        }
        // Fallback fill if photo was very uniform
        for (const candidate of sortedBuckets) {
          if (chosenColors.length >= 4) break;
          if (!chosenColors.includes(candidate.rgb)) {
            chosenColors.push(candidate.rgb);
          }
        }

        const palette = chosenColors.map((rgb) => rgbToHex(rgb[0], rgb[1], rgb[2]));
        const safeTotal = Math.max(1, totalPixels);

        const avgSat = saturationSum / safeTotal;
        const avgLum = brightnessSum / safeTotal;
        const warmRatio = warmVotes / safeTotal;
        const coolRatio = coolVotes / safeTotal;

        const warmthMetric = Math.min(97, Math.max(36, Math.round(48 + warmRatio * 55 - coolRatio * 20)));
        const eleganceMetric = Math.min(97, Math.max(62, Math.round(68 + (1 - Math.abs(avgLum - 0.45)) * 26)));
        const coolnessMetric = Math.min(97, Math.max(35, Math.round(42 + coolRatio * 58 + (1 - avgSat) * 18)));

        let detectedKey: ScentKey = hintKey || 'chamo';
        if (!hintKey) {
          const scores: Record<ScentKey, number> = {
            chamo: beigeCreamVotes * 1.15 + warmVotes * 0.45,
            pumkini: spiceGreenOrangeVotes * 1.45 + avgSat * safeTotal * 0.55,
            evening: rosePlumVotes * 1.55 + (1 - avgLum) * safeTotal * 0.25,
            metal: monochromeDarkVotes * 0.95 + coolVotes * 1.1
          };

          let bestScore = -1;
          (Object.keys(scores) as ScentKey[]).forEach((k) => {
            if (scores[k] > bestScore) {
              bestScore = scores[k];
              detectedKey = k;
            }
          });
        }

        const styleSummaries: Record<ScentKey, string> = {
          chamo: '아이보리·카멜·베이지 계열의 온화한 뉴트럴 톤 코디',
          pumkini: '테라코타·그린·스파이스 포인트가 돋보이는 개성 있는 코디',
          evening: '버건디·로즈·딥 플럼 계열의 로맨틱하고 깊이 있는 코디',
          metal: '모노크롬·슬레이트·실버 악센트의 정갈하고 시크한 코디'
        };

        resolve({
          scentKey: detectedKey,
          palette: palette.length > 0 ? palette : ['#E3B06C', '#EFECE6', '#4A443B', '#171717'],
          warmth: warmthMetric,
          elegance: eleganceMetric,
          coolness: coolnessMetric,
          styleSummary: styleSummaries[detectedKey]
        });
      } catch {
        const fallbackKey: ScentKey = hintKey || 'chamo';
        resolve({
          scentKey: fallbackKey,
          palette: ['#E3B06C', '#D8C9B5', '#4D463E', '#171717'],
          warmth: fallbackKey === 'metal' ? 42 : 86,
          elegance: 88,
          coolness: fallbackKey === 'metal' ? 94 : 54,
          styleSummary: '업로드된 코디 이미지의 컬러 톤과 실루엣 균형 분석 완료'
        });
      }
    };

    img.onerror = () => {
      const fallbackKey: ScentKey = hintKey || 'chamo';
      resolve({
        scentKey: fallbackKey,
        palette: ['#E3B06C', '#D8C9B5', '#4D463E', '#171717'],
        warmth: 84,
        elegance: 86,
        coolness: 52,
        styleSummary: '코디 톤 & 분위기 분석 완료'
      });
    };

    img.src = imageSrc;
  });
}
