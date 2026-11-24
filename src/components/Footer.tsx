import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="pt-12 pb-24 min-[601px]:pb-12 px-4 min-[601px]:px-6 min-[1025px]:px-4 border-t border-black/10 bg-[#EFECE6] text-xs text-[#171717]/70">
      <div className="max-w-[1080px] mx-auto space-y-6">
        <div className="flex flex-col min-[601px]:flex-row justify-between items-center gap-4 text-center min-[601px]:text-left">
          <div className="flex items-center space-x-3">
            <span className="font-serif text-lg font-semibold tracking-widest text-[#171717]">
              TAMBURINS
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#171717]/50">
              Official Olfactory Showcase
            </span>
          </div>
          <p className="font-mono text-[11px] text-[#171717]/60">
            &copy; 2026 TAMBURINS. Sculptural Fragrance Experience. All Rights Reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[#171717]/80 text-[11px] font-mono tracking-wider">
            <a
              href="#stores-events"
              className="hover:text-[#171717] hover:underline transition-colors whitespace-nowrap"
            >
              행사 · 매장 안내
            </a>
            <a
              href="https://www.tamburins.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#171717] hover:underline transition-colors whitespace-nowrap"
            >
              Official Store ↗
            </a>
            <a
              href="#hero"
              className="hover:text-[#171717] hover:underline transition-colors whitespace-nowrap"
            >
              Back to Top ↑
            </a>
          </div>
        </div>

        {/* Academic / AI Recreation Credit Notice */}
        <div className="pt-5 border-t border-black/10 text-center">
          <p className="text-xs text-[#171717]/75 font-medium tracking-tight leading-relaxed break-keep text-pretty">
            본 웹페이지는 「AI 아트코딩과 윤리」 강의를 통해 AI로 재현한 홈페이지입니다.
          </p>
          <p className="text-[11px] font-mono text-[#171717]/50 mt-1 break-keep text-pretty">
            Recreated with AI for the &ldquo;AI Art Coding &amp; Ethics&rdquo; Lecture · Educational Showcase Credit
          </p>
        </div>
      </div>
    </footer>
  );
};
