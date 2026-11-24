import React, { useState, useEffect } from 'react';
import { CollectionItem, MemberUser, ProductReview, ReviewScentTag, ScentKey } from '../types.ts';
import { REVIEW_SCENT_TAGS, formatKRW } from '../data/scents.ts';
import { ProductImage } from './ProductImage.tsx';
import { X, Star, ShoppingBag, Sparkles, ThumbsUp, CheckCircle2 } from 'lucide-react';

interface ProductDetailModalProps {
  product: CollectionItem | null;
  reviews: ProductReview[];
  helpfulIds: string[];
  currentUser?: MemberUser | null;
  onClose: () => void;
  onAddToCart: (productId: string, quantity?: number) => void;
  onSelectAndSpray: (key: ScentKey) => void;
  onSubmitReview: (input: {
    productId: string;
    authorName: string;
    rating: number;
    scentTag: ReviewScentTag;
    comment: string;
  }) => void;
  onToggleHelpful: (reviewId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  reviews,
  helpfulIds,
  currentUser,
  onClose,
  onAddToCart,
  onSelectAndSpray,
  onSubmitReview,
  onToggleHelpful
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [authorName, setAuthorName] = useState<string>(currentUser?.name ?? '');
  const [rating, setRating] = useState<number>(5);
  const [scentTag, setScentTag] = useState<ReviewScentTag>(REVIEW_SCENT_TAGS[0]);
  const [comment, setComment] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);

  useEffect(() => {
    setQuantity(1);
    setFormError('');
    setJustSubmitted(false);
    if (currentUser?.name) {
      setAuthorName((prev) => prev || currentUser.name);
    }
  }, [product?.id, currentUser]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const avgRating =
    productReviews.length > 0
      ? (productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1)
      : '0.0';

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setFormError('작성자 이름(또는 닉네임)을 입력해 주세요.');
      return;
    }
    if (comment.trim().length < 5) {
      setFormError('향에 대한 솔직한 후기를 5자 이상 남겨주세요.');
      return;
    }

    onSubmitReview({
      productId: product.id,
      authorName: authorName.trim(),
      rating,
      scentTag,
      comment: comment.trim()
    });

    setAuthorName(currentUser?.name ?? '');
    setRating(5);
    setComment('');
    setFormError('');
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name} 상세 정보 및 고객 후기`}
    >
      <div
        className="bg-[#F5F4EF] border border-black/15 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="모달 닫기"
          className="sticky top-4 float-right mr-4 mt-4 z-20 w-10 h-10 rounded-full bg-white/90 border border-black/15 flex items-center justify-center text-[#171717] hover:bg-[#171717] hover:text-white transition-colors cursor-pointer shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-10">
          {/* Left Column: Studio Photo & Purchase Module */}
          <div className="lg:col-span-5 space-y-5">
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-black/10 bg-[#EAE7DF]">
              <ProductImage
                visualKey={product.visualKey}
                src={product.imageUrl}
                alt={`${product.name} 스튜디오 사진`}
                className="w-full h-full"
              />
            </div>

            <div>
              <div className="text-xs font-mono text-[#171717]/60">
                {product.category} · {product.volume}
              </div>
              <div className="flex items-baseline justify-between gap-3 mt-1">
                <h3 className="font-serif text-2xl min-[601px]:text-3xl text-[#171717] font-medium leading-snug break-keep">
                  {product.name}{' '}
                  <span className="inline-block whitespace-nowrap text-base min-[601px]:text-lg font-sans font-normal text-[#171717]/65">
                    ({product.koreanName})
                  </span>
                </h3>
              </div>
              <div className="text-xl font-semibold text-[#171717] tabular-nums mt-1.5">
                {formatKRW(product.priceKRW)}
              </div>
              <p className="text-xs text-[#171717]/80 leading-relaxed mt-3 break-keep text-pretty">
                {product.description}
              </p>
            </div>

            {/* Olfactory Pyramid */}
            <div className="pt-4 border-t border-black/10 text-xs font-mono space-y-1.5 text-[#171717]/75">
              {product.extraMeta ? (
                product.extraMeta.map((m, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-black/45">{m.label}</span>
                    <span>{m.value}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-black/45">Top</span>
                    <span>{product.topNotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/45">Middle</span>
                    <span>{product.middleNotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/45">Base</span>
                    <span>{product.baseNotes}</span>
                  </div>
                </>
              )}
            </div>

            {/* Quantity & Add to Bag */}
            <div className="pt-4 border-t border-black/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#171717]/70">수량 선택</span>
                <div className="inline-flex items-center border border-black/20 rounded-full bg-white/80">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-sm hover:bg-black/5 rounded-l-full cursor-pointer"
                    aria-label="수량 감소"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-xs font-mono tabular-nums font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center text-sm hover:bg-black/5 rounded-r-full cursor-pointer"
                    aria-label="수량 증가"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onAddToCart(product.id, quantity);
                  onClose();
                }}
                className="w-full min-h-[44px] py-3 px-5 bg-[#171717] text-white text-xs font-medium tracking-wider rounded-full hover:bg-black transition-colors cursor-pointer flex items-center justify-center gap-2 tabular-nums"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>장바구니 담기 · {formatKRW(product.priceKRW * quantity)}</span>
              </button>

              {product.scentKey && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectAndSpray(product.scentKey!);
                  }}
                  className="w-full min-h-[40px] py-2.5 px-4 border border-black/20 text-[#171717] text-xs tracking-wider rounded-full hover:border-[#171717] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>상단 히어로에서 미스트 분사하기</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Product Reviews & Write Review Form */}
          <div className="lg:col-span-7 lg:border-l lg:border-black/10 lg:pl-8 space-y-6">
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#171717]/55 block">
                  Customer Reviews
                </span>
                <h4 className="font-serif text-2xl text-[#171717]">
                  실제 구매 · 시향 후기
                </h4>
              </div>
              <div className="text-right tabular-nums">
                <div className="flex items-center justify-end gap-1.5">
                  <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  <span className="text-xl font-semibold text-[#171717]">{avgRating}</span>
                </div>
                <span className="text-xs font-mono text-[#171717]/55">
                  총 {productReviews.length}건의 리뷰
                </span>
              </div>
            </div>

            {/* Write Review Form */}
            <form
              onSubmit={handleReviewSubmit}
              className="bg-[#EFECE6]/90 border border-black/10 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#171717]">이 제품에 후기 남기기</span>
                <div className="flex items-center gap-1" role="radiogroup" aria-label="별점 선택">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`${star}점`}
                      className="p-0.5 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= rating
                            ? 'fill-[#D4AF37] text-[#D4AF37]'
                            : 'text-black/20'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono tabular-nums text-[#171717]/70 ml-1">
                    {rating}.0
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="작성자 이름 (예: 지민)"
                  maxLength={24}
                  className="w-full px-3.5 py-2.5 text-xs bg-white/90 border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                />
                <select
                  value={scentTag}
                  onChange={(e) => setScentTag(e.target.value as ReviewScentTag)}
                  aria-label="향기 인상 태그"
                  className="w-full px-3.5 py-2.5 text-xs bg-white/90 border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                >
                  {REVIEW_SCENT_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`${product.name}의 첫 향, 잔향, 지속력에 대한 솔직한 감상을 들려주세요.`}
                maxLength={400}
                className="w-full px-3.5 py-2.5 text-xs bg-white/90 border border-black/15 rounded-xl focus:outline-none focus:border-[#171717] resize-none"
              />

              {formError && <p className="text-xs text-red-700 font-medium">{formError}</p>}
              {justSubmitted && (
                <p className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>소중한 후기가 등록되었습니다.</span>
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#171717] text-white text-xs font-medium tracking-wider rounded-full hover:bg-black transition-colors cursor-pointer"
                >
                  후기 등록하기
                </button>
              </div>
            </form>

            {/* Product-specific Review List */}
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {productReviews.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#171717]/55">
                  아직 등록된 후기가 없습니다. 첫 번째 시향 후기를 남겨보세요.
                </div>
              ) : (
                productReviews.map((rev) => {
                  const isHelpful = helpfulIds.includes(rev.id);
                  return (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-white/75 border border-black/8 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-[#171717]">{rev.authorName}</span>
                          <span className="text-[#171717]/35">·</span>
                          <span className="font-mono text-[#171717]/60">{rev.scentTag}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= rev.rating
                                  ? 'fill-[#D4AF37] text-[#D4AF37]'
                                  : 'text-black/15'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-[#171717]/80 leading-relaxed break-keep">
                        {rev.comment}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-[#171717]/50">
                        <span>{rev.createdAt}</span>
                        <button
                          type="button"
                          onClick={() => onToggleHelpful(rev.id)}
                          className={`inline-flex items-center gap-1 cursor-pointer transition-colors tabular-nums ${
                            isHelpful ? 'text-[#171717] font-semibold' : 'hover:text-[#171717]'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>도움이 돼요 ({rev.helpfulCount})</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
