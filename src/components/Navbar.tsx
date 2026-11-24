import React, { useState } from 'react';
import { Volume2, VolumeX, ShoppingBag, Menu, X, User } from 'lucide-react';
import { MemberUser } from '../types.ts';

interface NavbarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  cartCount: number;
  onOpenCart: () => void;
  currentUser: MemberUser | null;
  onOpenAuth: () => void;
}

const NAV_ITEMS: { href: string; ko: string; en: string }[] = [
  { href: '#hero', ko: '브랜드 서사', en: 'Narrative' },
  { href: '#scent-finder', ko: '맞춤 향기 찾기', en: 'Scent Finder' },
  { href: '#products', ko: '컬렉션 스토어', en: 'Collection' },
  { href: '#reviews', ko: '고객 후기', en: 'Reviews' },
  { href: '#stores-events', ko: '행사·공지·매장', en: 'Stores & News' },
  { href: '#glitter', ko: '글리터 캔버스', en: 'Scent Canvas' }
];

export const Navbar: React.FC<NavbarProps> = ({
  soundEnabled,
  onToggleSound,
  cartCount,
  onOpenCart,
  currentUser,
  onOpenAuth
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#F5F4EF]/90 backdrop-blur-md border-b border-black/8">
      <div className="max-w-[1080px] mx-auto px-4 min-[601px]:px-6 min-[1025px]:px-4 py-3 flex items-center justify-between gap-2 min-[1025px]:gap-4">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href="#hero"
          className="font-serif text-lg min-[601px]:text-xl font-semibold tracking-widest text-[#171717] hover:opacity-80 transition-opacity whitespace-nowrap shrink-0"
        >
          TAMBURINS
        </a>

        {/* Zone 2: Single-line navigation menu on PC (>=1025px) */}
        <nav
          aria-label="주요 섹션 이동"
          className="hidden min-[1025px]:flex items-center gap-4 xl:gap-5 text-[#171717]/75"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group flex flex-col items-center leading-tight hover:text-[#171717] transition-colors whitespace-nowrap shrink-0 py-0.5"
            >
              <span className="text-[12px] font-medium tracking-tight group-hover:underline underline-offset-4 whitespace-nowrap">
                {item.ko}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#171717]/45 group-hover:text-[#171717]/70 whitespace-nowrap">
                {item.en}
              </span>
            </a>
          ))}
        </nav>

        {/* Zone 3: Icon-Only Controls (Sound, Account, Shopping Bag) + Hamburger Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? '사운드 끄기' : '사운드 켜기'}
            title={soundEnabled ? '사운드 켜짐' : '음소거'}
            className="w-9 h-9 rounded-full border border-black/20 flex items-center justify-center hover:border-[#171717] transition-colors cursor-pointer bg-white/60 shrink-0"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#D4AF37]" />
            ) : (
              <VolumeX className="w-4 h-4 opacity-55 text-[#171717]" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenAuth}
            aria-label={currentUser ? `${currentUser.name}님 계정 관리` : '로그인 및 회원가입'}
            title={currentUser ? `${currentUser.name}님 계정` : '로그인 / 회원가입'}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              currentUser
                ? 'border-[#171717] bg-white text-[#171717]'
                : 'border-black/20 bg-white/60 text-[#171717]/85 hover:border-[#171717]'
            }`}
          >
            <User className={`w-4 h-4 ${currentUser ? 'text-[#D4AF37]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`쇼핑백 (${cartCount}개)`}
            title={`쇼핑백 (${cartCount})`}
            className="relative w-9 h-9 rounded-full bg-[#171717] text-white hover:bg-black transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#D4AF37] text-[#171717] font-mono tabular-nums text-[10px] font-bold flex items-center justify-center border border-[#F5F4EF]">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="섹션 메뉴 열기"
            aria-expanded={mobileMenuOpen}
            className="min-[1025px]:hidden flex items-center justify-center w-9 h-9 rounded-full border border-black/15 bg-white/70 text-[#171717] hover:border-black transition-colors cursor-pointer shrink-0"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Hamburger Dropdown Navigation Drawer (Mobile <= 600px & Tablet <= 1024px) */}
      {mobileMenuOpen && (
        <nav
          aria-label="모바일 섹션 이동"
          className="min-[1025px]:hidden border-t border-black/8 bg-[#FAF9F5]/95 backdrop-blur-md px-5 py-3 grid grid-cols-2 min-[601px]:grid-cols-3 gap-2"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col px-3 py-2 rounded-xl bg-white/75 border border-black/8 hover:border-black/30 transition-colors"
            >
              <span className="text-xs font-medium text-[#171717]">{item.ko}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#171717]/50">
                {item.en}
              </span>
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAuth();
            }}
            className="flex flex-col text-left px-3 py-2 rounded-xl bg-[#EFECE6] border border-black/10 hover:border-black/30 transition-colors cursor-pointer col-span-2 min-[601px]:col-span-3"
          >
            <span className="text-xs font-medium text-[#171717]">
              {currentUser ? `${currentUser.name}님 계정 관리 · 로그아웃` : '로그인 / 회원가입'}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#171717]/50">
              {currentUser ? currentUser.email : 'Member Account'}
            </span>
          </button>
        </nav>
      )}
    </header>
  );
};
