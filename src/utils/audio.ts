import { ScentKey } from '../types.ts';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function playSprayAudio(soundEnabled: boolean) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Master low-pass & gain to keep singing bowl resonance velvety and meditative
    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(1650, now);
    masterFilter.Q.setValueAtTime(0.7, now);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.55, now);

    masterFilter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Subtle breathy mist onset blending gently into the singing bowl bloom
    const mistDuration = 0.24;
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * mistDuration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const mistSource = ctx.createBufferSource();
    mistSource.buffer = buffer;

    const mistFilter = ctx.createBiquadFilter();
    mistFilter.type = 'bandpass';
    mistFilter.frequency.setValueAtTime(1400, now);
    mistFilter.Q.setValueAtTime(1.2, now);

    const mistGain = ctx.createGain();
    mistGain.gain.setValueAtTime(0.0005, now);
    mistGain.gain.linearRampToValueAtTime(0.045, now + 0.04);
    mistGain.gain.exponentialRampToValueAtTime(0.0005, now + mistDuration);

    mistSource.connect(mistFilter);
    mistFilter.connect(mistGain);
    mistGain.connect(masterFilter);
    mistSource.start(now);
    mistSource.stop(now + mistDuration);

    // Resonant Tibetan Singing Bowl overtone partials (warm D4 harmonic shimmer)
    const bowlPartials: { freq: number; gain: number; decay: number; attack: number }[] = [
      { freq: 293.66, gain: 0.16, decay: 2.9, attack: 0.06 },   // Fundamental D4
      { freq: 295.15, gain: 0.14, decay: 2.9, attack: 0.07 },   // Detuned twin for beating wobble
      { freq: 440.0, gain: 0.06, decay: 2.4, attack: 0.09 },    // Warm 5th A4
      { freq: 587.33, gain: 0.055, decay: 2.1, attack: 0.05 },  // Octave D5
      { freq: 809.5, gain: 0.025, decay: 1.7, attack: 0.04 },   // Bowl metallic partial (~2.756x)
      { freq: 1174.66, gain: 0.015, decay: 1.25, attack: 0.03 } // Soft halo overtone
    ];

    bowlPartials.forEach((p, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx < 2 ? 'sine' : idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(p.freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(p.gain, now + p.attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gain);
      gain.connect(masterFilter);

      osc.start(now);
      osc.stop(now + p.decay + 0.05);
    });
  } catch (err) {
    console.debug('Audio singing bowl error:', err);
  }
}

export function playChimeAudio(soundEnabled: boolean) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + 1.0);
    filter.Q.setValueAtTime(0.65, now);
    filter.connect(ctx.destination);

    // Warm architectural chime in mid-low register (D4 -> A4 -> E5)
    const tones: { freq: number; delay: number; gain: number; duration: number }[] = [
      { freq: 293.66, delay: 0.0, gain: 0.11, duration: 0.95 },  // D4 warm foundation
      { freq: 440.0, delay: 0.045, gain: 0.08, duration: 1.05 }, // A4 fifth
      { freq: 659.25, delay: 0.09, gain: 0.045, duration: 1.1 }  // E5 soft 9th
    ];

    tones.forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startT = now + t.delay;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(t.freq, startT);

      gain.gain.setValueAtTime(0.0001, startT);
      gain.gain.linearRampToValueAtTime(t.gain, startT + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + t.duration);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(startT);
      osc.stop(startT + t.duration + 0.04);
    });
  } catch (err) {
    console.debug('Audio chime error:', err);
  }
}

/**
 * Deep, weighty, velvety architectural chord for Scent Finder option selection.
 * Tuned to a warm baritone/felt-grand-piano Cmaj9 voicing (C3 + G3 + B3 + D4).
 */
export function playQuizSelectAudio(soundEnabled: boolean) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Warm sweeping low-pass filter mimicking a felt piano damper in a stone gallery
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1150, now);
    filter.frequency.exponentialRampToValueAtTime(480, now + 1.45);
    filter.Q.setValueAtTime(0.75, now);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, now);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Rich low-mid harmonic voicing (C2 sub warmth + C3 + G3 + B3 + D4)
    const tones: {
      freq: number;
      type: OscillatorType;
      delay: number;
      attack: number;
      gain: number;
      duration: number;
    }[] = [
      { freq: 65.41, type: 'sine', delay: 0.0, attack: 0.03, gain: 0.055, duration: 0.85 },      // C2 subtle chest weight
      { freq: 130.81, type: 'triangle', delay: 0.0, attack: 0.035, gain: 0.14, duration: 1.45 },  // C3 warm woody body
      { freq: 131.35, type: 'sine', delay: 0.0, attack: 0.04, gain: 0.09, duration: 1.45 },       // Subtle resonant shimmer
      { freq: 196.0, type: 'sine', delay: 0.035, attack: 0.04, gain: 0.095, duration: 1.4 },      // G3 grounded fifth
      { freq: 246.94, type: 'sine', delay: 0.07, attack: 0.045, gain: 0.075, duration: 1.35 },    // B3 velvety major-7th
      { freq: 293.66, type: 'sine', delay: 0.105, attack: 0.05, gain: 0.05, duration: 1.3 }       // D4 lingering elegance
    ];

    tones.forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startT = now + t.delay;

      osc.type = t.type;
      osc.frequency.setValueAtTime(t.freq, startT);

      gain.gain.setValueAtTime(0.0001, startT);
      gain.gain.linearRampToValueAtTime(t.gain, startT + t.attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + t.duration);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(startT);
      osc.stop(startT + t.duration + 0.06);
    });
  } catch (err) {
    console.debug('Audio quiz select error:', err);
  }
}

/**
 * Mood-specific glitter sound effects:
 * - chamo: Warm Golden Bell (목조 온기 & 골든 차임 아르페지오)
 * - pumkini: Sweet Pumpkin Bubble Pop & Staccato Shimmer (달콤 쌉싸래한 팝 & 스파클링 피치)
 * - evening: Sunset Rose Harp & Ethereal Glass Tremolo (황혼 장미빛 하프 & 몽환적 글래스 릴리스)
 * - metal: Icy Crystal Silver Ping (서늘한 순은 메탈릭 팅 & 극초고역대 아이스 링잉)
 */
export function playGlitterMoodAudio(
  scentKey: ScentKey,
  soundEnabled: boolean,
  intensity: 'burst' | 'micro' = 'burst'
) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const isMicro = intensity === 'micro';
  const volScale = isMicro ? 0.35 : 1.0;

  try {
    switch (scentKey) {
      case 'chamo': {
        // Warm Golden Bell / Wooden Kalimba Harmonics
        // Pentatonic warm golden chords (G4: 392, B4: 493.88, D5: 587.33, G5: 783.99)
        const notes = isMicro ? [587.33, 783.99] : [392, 493.88, 587.33, 783.99, 987.77];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          // Warm low-pass filter to simulate soft wood and golden amber
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(2200, now);

          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.035);

          const startT = now + idx * 0.035;
          const peakGain = (0.08 / Math.sqrt(notes.length)) * volScale;
          const dur = isMicro ? 0.35 : 0.65;

          gain.gain.setValueAtTime(0.001, startT);
          gain.gain.exponentialRampToValueAtTime(peakGain, startT + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startT + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startT);
          osc.stop(startT + dur);
        });
        break;
      }

      case 'pumkini': {
        // Sweet Pumpkin Bouncy Bubble Pop & Playful Sparkle
        // Rapid pitch sweep with percussive attack & sweet warm second harmonic
        const baseFreq = isMicro ? 700 : 520;
        const targetFreq = isMicro ? 1100 : 1280;

        // Main playful sweep oscillator
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, now);
        osc1.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.08);

        const dur = isMicro ? 0.22 : 0.42;
        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.exponentialRampToValueAtTime(0.18 * volScale, now + 0.015);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + dur);

        // Secondary playful staccato chime
        if (!isMicro) {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(1480, now + 0.06);
          osc2.frequency.exponentialRampToValueAtTime(1860, now + 0.14);

          gain2.gain.setValueAtTime(0.001, now + 0.06);
          gain2.gain.exponentialRampToValueAtTime(0.11 * volScale, now + 0.08);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(now + 0.06);
          osc2.stop(now + 0.38);
        }
        break;
      }

      case 'evening': {
        // Sunset Rose Harp & Romantic Ethereal Tremolo
        // Cascading shimmering harp notes (C#5: 554.37, F5: 698.46, G#5: 830.61, C6: 1046.50, F6: 1396.91)
        const roseNotes = isMicro ? [830.61, 1046.50] : [554.37, 698.46, 830.61, 1046.50, 1396.91];
        
        roseNotes.forEach((freq, idx) => {
          const oscA = ctx.createOscillator();
          const oscB = ctx.createOscillator();
          const gain = ctx.createGain();

          oscA.type = 'sine';
          oscB.type = 'sine';

          const startT = now + idx * 0.045;
          // Slight 2.5Hz detune to create a lush chorus/shimmer
          oscA.frequency.setValueAtTime(freq, startT);
          oscB.frequency.setValueAtTime(freq + 2.5, startT);

          const dur = isMicro ? 0.45 : 0.85;
          const peak = (0.07 / Math.sqrt(roseNotes.length)) * volScale;

          gain.gain.setValueAtTime(0.001, startT);
          gain.gain.exponentialRampToValueAtTime(peak, startT + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, startT + dur);

          oscA.connect(gain);
          oscB.connect(gain);
          gain.connect(ctx.destination);

          oscA.start(startT);
          oscB.start(startT);
          oscA.stop(startT + dur);
          oscB.stop(startT + dur);
        });
        break;
      }

      case 'metal': {
        // Icy Crystal Silver Ping & Metallic Aldehyde Resonance
        // High crystalline harmonic ring (C7: 2093Hz, G7: 3136Hz, C8: 4186Hz)
        const metalFreqs = isMicro ? [2637, 3951] : [2093, 2793, 3520, 4186];

        metalFreqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          // High-Q bandpass creates genuine ringing metal glass resonance
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(freq, now);
          filter.Q.setValueAtTime(14, now);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          const dur = isMicro ? 0.35 : (idx === 0 ? 0.95 : 0.6);
          const peak = (0.09 / Math.sqrt(metalFreqs.length)) * volScale;

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(peak, now + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + dur);
        });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.debug('Glitter mood audio error:', err);
  }
}
