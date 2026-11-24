import chamoImg from '../assets/images/tamburins_chamo_egg_v2_1794889015905.jpg';
import pumkiniImg from '../assets/images/tamburins_pumkini_50ml_v2_1794889016761.jpg';
import eveningImg from '../assets/images/tamburins_evening_egg_v2_1794889016941.jpg';
import metalImg from '../assets/images/tamburins_holy_metal_shell_v2_1794889017888.jpg';
import laleImg from '../assets/images/tamburins_lale_50ml_v2_1794889019343.jpg';
import candleImg from '../assets/images/tamburins_candle_210g_v2_1794889019412.jpg';

import auraWarmChamo from '../assets/images/aura_sculpt_chamo_1794889201272.jpg';
import auraWittyPumkini from '../assets/images/aura_sculpt_pumkini_1794889201647.jpg';
import auraSunsetEvening from '../assets/images/aura_sculpt_evening_1794889202224.jpg';
import auraIcyMetal from '../assets/images/aura_sculpt_metal_1794889203140.jpg';

import spangleChamo from '../assets/images/spangle_motif_chamo_1794889380787.jpg';
import spanglePumkini from '../assets/images/spangle_motif_pumkini_1794889379822.jpg';
import spangleEvening from '../assets/images/spangle_motif_evening_1794889380488.jpg';
import spangleMetal from '../assets/images/spangle_motif_metal_1794889381315.jpg';

import outfitChamo from '../assets/images/outfit_look_chamo_1794891402646.jpg';
import outfitPumkini from '../assets/images/outfit_look_pumkini_1794891403455.jpg';
import outfitEvening from '../assets/images/outfit_look_evening_1794891404053.jpg';
import outfitMetal from '../assets/images/outfit_look_metal_1794891404641.jpg';

import { ProductVisualKey, ScentKey } from '../types.ts';

export const PRODUCT_IMAGES: Record<ProductVisualKey, string> = {
  chamo: chamoImg,
  pumkini: pumkiniImg,
  evening: eveningImg,
  metal: metalImg,
  lale: laleImg,
  candle: candleImg
};

export const AURA_PORTRAITS: Record<ScentKey, string> = {
  chamo: auraWarmChamo,
  pumkini: auraWittyPumkini,
  evening: auraSunsetEvening,
  metal: auraIcyMetal
};

export const SPANGLE_MOTIF_IMAGES: Record<ScentKey, string> = {
  chamo: spangleChamo,
  pumkini: spanglePumkini,
  evening: spangleEvening,
  metal: spangleMetal
};

export const OUTFIT_PRESET_IMAGES: Record<ScentKey, string> = {
  chamo: outfitChamo,
  pumkini: outfitPumkini,
  evening: outfitEvening,
  metal: outfitMetal
};
