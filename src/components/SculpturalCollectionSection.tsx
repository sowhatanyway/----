import React from 'react';
import { ScentKey, CollectionItem, ProductReview } from '../types.ts';
import { COLLECTION_ITEMS, formatKRW } from '../data/scents.ts';
import { ProductImage } from './ProductImage.tsx';
import { ShoppingBag, Star, MessageSquare, Sparkles } from 'lucide-react';

interface SculpturalCollectionSectionProps {
  reviews: ProductReview[];
  onSelectAndSpray: (key: ScentKey) => void;
  onAddToCart: (productId: string) => void;
  onOpenProductModal: (product: CollectionItem) => void;
}

export const SculpturalCollectionSection: React.FC<SculpturalCollectionSectionProps> = ({
  reviews,
  onSelectAndSpray,
  onAddToCart,
  onOpenProductModal
}) => {
  const getReviewStats = (productId: string) => {
    const productReviews = reviews.filter((r) => r.productId === productId);
    if (productReviews.length === 0) {
      return { avg: 0, count: 0 };
    }
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      avg: Number((sum / productReviews.length).toFixed(1)),
      count: productReviews.length
    };
  };

  return (
    <section id="products" className="py-20 min-[601px]:py-24 px-4 min-[601px]:px-6 min-[1025px]:px-4 max-w-[1080px] mx-auto">
      <div className="flex flex-col min-[601px]:flex-row min-[601px]:items-end justify-between mb-12 min-[601px]:mb-14 border-b border-black/10 pb-6">
        <div>
          <span className="text-xs tracking-[0.25em] text-[#171717]/60 uppercase block mb-2 font-mono">
            Official Verified Collection
          </span>
          <h2 className="font-serif text-3xl min-[601px]:text-4xl min-[1025px]:text-5xl text-[#171717] font-light text-balance">
            Sculptural Collection
          </h2>
        </div>
        <p className="text-xs tracking-wider text-[#171717]/70 max-w-md mt-4 min-[601px]:mt-0 leading-relaxed break-keep text-pretty">
          탬버린즈의 시그니처 <strong>에그 퍼퓸(Egg Perfume)</strong>과{' '}
          <strong>쉘 퍼퓸 핸드(Shell Perfume Hand)</strong>, 그리고{' '}
          <strong>조각 오브제 퍼퓸 바틀</strong>을 실제 스튜디오 아카이브와 함께 만나보세요.
        </p>
      </div>

      {/* Responsive Studio Product Grid: 1 col (<=600), 2 cols (601~1024), 3 cols (>=1025) */}
      <div className="grid grid-cols-1 min-[601px]:grid-cols-2 min-[1025px]:grid-cols-3 gap-6 min-[1025px]:gap-7">
        {COLLECTION_ITEMS.map((item) => {
          const stats = getReviewStats(item.id);

          return (
            <article
              key={item.id}
              className="group bg-[#EFECE6]/75 rounded-2xl border border-black/10 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl flex flex-col justify-between h-full"
            >
              <div>
                {/* Uniform 4:3 Studio Product Photography */}
                <button
                  type="button"
                  onClick={() => onOpenProductModal(item)}
                  className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#EAE7DF] border border-black/5 block cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171717]"
                  aria-label={`${item.name} 상세 및 후기 보기`}
                >
                  <ProductImage
                    visualKey={item.visualKey}
                    src={item.imageUrl}
                    alt={`${item.name} (${item.koreanName}) 스튜디오 제품 사진`}
                    className="w-full h-full"
                    imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3.5">
                    <span className="text-[11px] font-medium tracking-wider text-white">
                      {item.badgeText}
                    </span>
                    <span className="text-[11px] font-mono text-white/90 underline underline-offset-2">
                      상세 · 후기
                    </span>
                  </div>
                </button>

                {/* Clean Unboxed Metadata */}
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#171717]/60 font-mono">
                    <span>
                      {item.category} · {item.volume}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenProductModal(item)}
                      className="inline-flex items-center gap-1 text-[#171717]/80 hover:text-[#171717] transition-colors cursor-pointer tabular-nums whitespace-nowrap shrink-0"
                    >
                      <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                      <span className="font-semibold">{stats.count > 0 ? stats.avg.toFixed(1) : 'NEW'}</span>
                      <span className="text-[#171717]/50">({stats.count})</span>
                    </button>
                  </div>

                  {/* Title & Tabular KRW Price */}
                  <div className="flex items-baseline justify-between gap-2 mt-1.5">
                    <h3 className="font-serif text-xl min-[1025px]:text-[22px] text-[#171717] font-medium leading-snug break-keep">
                      {item.name}{' '}
                      <span className="inline-block whitespace-nowrap text-sm min-[601px]:text-base font-sans font-normal text-[#171717]/65">
                        ({item.koreanName})
                      </span>
                    </h3>
                    <span className="text-sm min-[601px]:text-base font-semibold text-[#171717] tabular-nums whitespace-nowrap shrink-0">
                      {formatKRW(item.priceKRW)}
                    </span>
                  </div>

                  <p className="text-xs text-[#171717]/75 mt-2.5 leading-relaxed break-keep text-pretty font-light">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Olfactory Notes + Commerce & Review Actions */}
              <div className="mt-5 pt-4 border-t border-black/10">
                <div className="text-[11px] text-[#171717]/70 font-mono space-y-1 mb-4">
                  {item.extraMeta ? (
                    item.extraMeta.map((meta, idx) => (
                      <div key={idx} className="flex justify-between gap-2">
                        <span className="text-black/45">{meta.label}</span>
                        <span className="text-right">{meta.value}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex justify-between gap-2">
                        <span className="text-black/45">Top</span>
                        <span className="text-right">{item.topNotes}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-black/45">Middle</span>
                        <span className="text-right">{item.middleNotes}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-black/45">Base</span>
                        <span className="text-right">{item.baseNotes}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onAddToCart(item.id)}
                      className="min-h-[42px] px-2.5 min-[601px]:px-3 py-2 bg-[#171717] text-white text-[11px] min-[601px]:text-xs font-medium tracking-wide rounded-full hover:bg-black transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                      <span>장바구니 담기</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenProductModal(item)}
                      className="min-h-[42px] px-2.5 min-[601px]:px-3 py-2 border border-black/20 text-[#171717] text-[11px] min-[601px]:text-xs font-medium tracking-wide rounded-full hover:border-[#171717] hover:bg-white/70 transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap tabular-nums"
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                      <span>후기 ({stats.count})</span>
                    </button>
                  </div>

                  {item.scentKey && (
                    <button
                      type="button"
                      onClick={() => onSelectAndSpray(item.scentKey!)}
                      className="w-full py-2 text-[11px] font-mono tracking-wider text-[#171717]/65 hover:text-[#171717] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      <span>상단 히어로에서 미스트 분사하기</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
