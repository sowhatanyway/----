import React from 'react';
import { ScentKey } from '../types.ts';

interface BottleSvgProps {
  scentKey?: ScentKey | 'lale' | 'candle';
  className?: string;
}

export const BottleSvg: React.FC<BottleSvgProps> = ({ scentKey = 'chamo', className = 'w-full h-full' }) => {
  switch (scentKey) {
    case 'chamo':
      return (
        <svg viewBox="0 0 200 260" className={className}>
          <ellipse cx="100" cy="240" rx="60" ry="12" fill="rgba(0,0,0,0.12)" />
          <path
            d="M100,20 C145,20 175,70 175,140 C175,200 145,230 100,230 C55,230 25,200 25,140 C25,70 55,20 100,20 Z"
            fill="#F4F1EA"
            stroke="#D1CCC1"
            strokeWidth="2"
          />
          <path
            d="M70,40 C110,35 150,70 150,130"
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <rect x="82" y="10" width="36" height="18" rx="4" fill="#222222" />
          <rect x="85" y="6" width="30" height="6" rx="2" fill="#444444" />
          <text
            x="100"
            y="150"
            fontFamily="Cormorant Garamond, serif"
            fontSize="14"
            fill="#171717"
            textAnchor="middle"
            fontWeight="600"
            letterSpacing="2"
          >
            TAMBURINS
          </text>
          <text
            x="100"
            y="170"
            fontFamily="Pretendard, sans-serif"
            fontSize="10"
            fill="#E3B06C"
            textAnchor="middle"
            fontWeight="600"
            letterSpacing="1"
          >
            CHAMO
          </text>
        </svg>
      );

    case 'pumkini':
      return (
        <svg viewBox="0 0 200 260" className={className}>
          <defs>
            <linearGradient id="silverGrad-pumkini" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E6E6E6" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#B3B3B3" />
            </linearGradient>
          </defs>
          <ellipse cx="100" cy="245" rx="55" ry="10" fill="rgba(0,0,0,0.15)" />
          <rect x="45" y="70" width="110" height="160" rx="8" fill="rgba(255, 255, 255, 0.88)" stroke="#D6D0C4" strokeWidth="2" />
          <rect x="50" y="95" width="100" height="130" rx="4" fill="rgba(232, 125, 62, 0.25)" />
          <rect x="60" y="110" width="80" height="70" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="1" />
          <text
            x="100"
            y="138"
            fontFamily="Cormorant Garamond, serif"
            fontSize="13"
            fill="#171717"
            textAnchor="middle"
            fontWeight="700"
            letterSpacing="1"
          >
            TAMBURINS
          </text>
          <text
            x="100"
            y="156"
            fontFamily="Pretendard, sans-serif"
            fontSize="9"
            fill="#E87D3E"
            textAnchor="middle"
            fontWeight="600"
            letterSpacing="1"
          >
            PUMKINI
          </text>
          <text
            x="100"
            y="168"
            fontFamily="Pretendard, sans-serif"
            fontSize="7"
            fill="#888888"
            textAnchor="middle"
          >
            PERFUME 50mL
          </text>
          <rect x="80" y="25" width="40" height="40" rx="4" fill="url(#silverGrad-pumkini)" stroke="#B0B0B0" strokeWidth="1" />
          <rect x="88" y="65" width="24" height="6" fill="#777777" />
        </svg>
      );

    case 'evening':
      return (
        <svg viewBox="0 0 200 260" className={className}>
          <defs>
            <linearGradient id="roseGrad-evening" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F7A8B8" />
              <stop offset="100%" stopColor="#C94E6B" />
            </linearGradient>
          </defs>
          <ellipse cx="100" cy="240" rx="60" ry="12" fill="rgba(0,0,0,0.12)" />
          <path
            d="M100,20 C145,20 175,70 175,140 C175,200 145,230 100,230 C55,230 25,200 25,140 C25,70 55,20 100,20 Z"
            fill="#F2E6E8"
            stroke="#D8C4C8"
            strokeWidth="2"
          />
          <path
            d="M100,20 C145,20 175,70 175,140 C175,200 145,230 100,230 C55,230 25,200 25,140 C25,70 55,20 100,20 Z"
            fill="url(#roseGrad-evening)"
            opacity="0.35"
          />
          <path
            d="M70,40 C110,35 150,70 150,130"
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <rect x="82" y="10" width="36" height="18" rx="4" fill="#171717" />
          <rect x="85" y="6" width="30" height="6" rx="2" fill="#555555" />
          <text
            x="100"
            y="150"
            fontFamily="Cormorant Garamond, serif"
            fontSize="14"
            fill="#171717"
            textAnchor="middle"
            fontWeight="600"
            letterSpacing="2"
          >
            TAMBURINS
          </text>
          <text
            x="100"
            y="170"
            fontFamily="Pretendard, sans-serif"
            fontSize="9"
            fill="#C94E6B"
            textAnchor="middle"
            fontWeight="600"
            letterSpacing="1"
          >
            EVENING GLOW
          </text>
        </svg>
      );

    case 'metal':
      return (
        <svg viewBox="0 0 220 240" className={className}>
          <ellipse cx="110" cy="220" rx="65" ry="10" fill="rgba(0,0,0,0.12)" />
          <path
            d="M40,90 C40,40 180,40 180,90 C180,170 160,200 110,200 C60,200 40,170 40,90 Z"
            fill="#EBF0F0"
            stroke="#C2CDCD"
            strokeWidth="2"
          />
          <rect x="85" y="30" width="50" height="20" rx="10" fill="#222222" />
          <circle cx="110" cy="40" r="5" fill="#7DA1A4" />
          <path
            d="M60,100 C90,120 130,120 160,100"
            fill="none"
            stroke="#D1DEDE"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <text
            x="110"
            y="145"
            fontFamily="Cormorant Garamond, serif"
            fontSize="13"
            fill="#171717"
            textAnchor="middle"
            fontWeight="600"
            letterSpacing="2"
          >
            TAMBURINS
          </text>
          <text
            x="110"
            y="165"
            fontFamily="Pretendard, sans-serif"
            fontSize="9"
            fill="#7DA1A4"
            textAnchor="middle"
            fontWeight="600"
            letterSpacing="1"
          >
            HOLY METAL
          </text>
        </svg>
      );

    case 'lale':
      return (
        <svg viewBox="0 0 200 260" className={className}>
          <defs>
            <linearGradient id="silverGrad-lale" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E6E6E6" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#B3B3B3" />
            </linearGradient>
          </defs>
          <ellipse cx="100" cy="245" rx="55" ry="10" fill="rgba(0,0,0,0.15)" />
          <rect x="45" y="70" width="110" height="160" rx="8" fill="rgba(255, 255, 255, 0.88)" stroke="#C8D2C5" strokeWidth="2" />
          <rect x="50" y="95" width="100" height="130" rx="4" fill="rgba(120, 160, 130, 0.2)" />
          <rect x="60" y="110" width="80" height="70" fill="#FFFFFF" stroke="#CCCCCC" strokeWidth="1" />
          <text
            x="100"
            y="138"
            fontFamily="Cormorant Garamond, serif"
            fontSize="13"
            fill="#171717"
            textAnchor="middle"
            fontWeight="700"
            letterSpacing="1"
          >
            TAMBURINS
          </text>
          <text
            x="100"
            y="156"
            fontFamily="Pretendard, sans-serif"
            fontSize="9"
            fill="#5A8A62"
            textAnchor="middle"
            fontWeight="600"
            letterSpacing="1"
          >
            LALE
          </text>
          <text
            x="100"
            y="168"
            fontFamily="Pretendard, sans-serif"
            fontSize="7"
            fill="#888888"
            textAnchor="middle"
          >
            PERFUME 50mL
          </text>
          <rect x="80" y="25" width="40" height="40" rx="4" fill="url(#silverGrad-lale)" stroke="#B0B0B0" strokeWidth="1" />
          <rect x="88" y="65" width="24" height="6" fill="#777777" />
        </svg>
      );

    case 'candle':
      return (
        <svg viewBox="0 0 200 240" className={className}>
          <ellipse cx="100" cy="220" rx="60" ry="12" fill="rgba(0,0,0,0.12)" />
          <rect x="45" y="60" width="110" height="150" rx="12" fill="#FAF8F5" stroke="#D1CCC1" strokeWidth="2" />
          <ellipse cx="100" cy="60" rx="55" ry="12" fill="#E8E3D8" stroke="#D1CCC1" strokeWidth="2" />
          <line x1="100" y1="60" x2="100" y2="42" stroke="#444444" strokeWidth="2" />
          <path d="M100,25 C105,35 103,42 100,42 C97,42 95,35 100,25 Z" fill="#E87D3E" />
          <circle cx="100" cy="35" r="3" fill="#FFE599" />
          <text
            x="100"
            y="140"
            fontFamily="Cormorant Garamond, serif"
            fontSize="13"
            fill="#171717"
            textAnchor="middle"
            fontWeight="600"
            letterSpacing="2"
          >
            TAMBURINS
          </text>
          <text
            x="100"
            y="160"
            fontFamily="Pretendard, sans-serif"
            fontSize="9"
            fill="#888888"
            textAnchor="middle"
            letterSpacing="1"
          >
            CANDLE OBJECT
          </text>
        </svg>
      );

    default:
      return null;
  }
};
