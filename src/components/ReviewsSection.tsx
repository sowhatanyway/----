import React, { useState, useMemo, useEffect } from 'react';
import { MemberUser, ProductReview, ReviewScentTag } from '../types.ts';
import { COLLECTION_ITEMS, REVIEW_SCENT_TAGS } from '../data/scents.ts';
import { ProductImage } from './ProductImage.tsx';
import { Star, ThumbsUp, CheckCircle2 } from 'lucide-react';

interface ReviewsSectionProps {
  reviews: ProductReview[];
  helpfulIds: string[];
  currentUser?: MemberUser | null;
  onSubmitReview: (input: {
    productId: string;
    authorName: string;
    rating: number;
    scentTag: ReviewScentTag;
    comment: string;
  }) => void;
  onToggleHelpful: (reviewId: string) => void;
}

type ReviewCategoryFilter = 'all' | 'perfume' | 'hand' | 'candle';

const REVIEW_CATEGORIES: { id: ReviewCategoryFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'perfume', label: '퍼퓸' },
  { id: 'hand', label: '핸드' },
  { id: 'candle', label: '캔들' }
];

function matchesReviewCategory(productId: string, category: ReviewCategoryFilter): boolean {
  if (category === 'all') return true;
  if (category === 'hand') return productId === 'metal-shell';
  if (category === 'candle') return productId === 'perfume-candle';
  return productId !== 'metal-shell' && productId !== 'perfume-candle';
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  helpfulIds,
  currentUser,
  onSubmitReview,
  onToggleHelpful
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ReviewCategoryFilter>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'rating'>('newest');

  // Form State
  const [formProductId, setFormProductId] = useState<string>(COLLECTION_ITEMS[0].id);
  const [authorName, setAuthorName] = useState<string>(currentUser?.name ?? '');
  const [rating, setRating] = useState<number>(5);
  const [scentTag, setScentTag] = useState<ReviewScentTag>(REVIEW_SCENT_TAGS[0]);
  const [comment, setComment] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser?.name) {
      setAuthorName((prev) => prev || currentUser.name);
    }
  }, [currentUser]);

  const overallAvg = useMemo(() => {
    if (reviews.length === 0) return '0.0';
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const base = reviews.filter((r) => matchesReviewCategory(r.productId, selectedCategory));

    if (sortBy === 'rating') {
      base.sort((a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt));
    } else {
      base.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return base;
  }, [reviews, selectedCategory, sortBy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setFormError('작성자 이름을 입력해 주세요.');
      return;
    }
    if (comment.trim().length < 5) {
      setFormError('향에 대한 후기를 5자 이상 작성해 주세요.');
      return;
    }

    onSubmitReview({
      productId: formProductId,
      authorName: authorName.trim(),
      rating,
      scentTag,
      comment: comment.trim()
    });

    setAuthorName(currentUser?.name ?? '');
    setRating(5);
    setComment('');
    setFormError('');
    setSubmitSuccess(true);
    setSelectedCategory('all');
    setTimeout(() => setSubmitSuccess(false), 3500);
  };

  return (
    <section
      id="reviews"
      className="py-20 min-[601px]:py-24 px-4 min-[601px]:px-6 min-[1025px]:px-4 bg-[#EFECE6]/60 border-t border-black/10"
    >
      <div className="max-w-[1080px] mx-auto">
        {/* Section Header + Aggregate Score */}
        <div className="flex flex-col min-[601px]:flex-row min-[601px]:items-end justify-between mb-12 border-b border-black/10 pb-6 gap-6">
          <div>
            <span className="text-xs tracking-[0.25em] text-[#171717]/60 uppercase block mb-2 font-mono">
              Customer Olfactory Journal
            </span>
            <h2 className="font-serif text-3xl min-[601px]:text-4xl min-[1025px]:text-5xl text-[#171717] font-light leading-tight break-keep text-pretty">
              Verified Reviews &amp; Impressions
            </h2>
          </div>

          <div className="flex items-center gap-6 tabular-nums">
            <div>
              <span className="text-[11px] font-mono text-[#171717]/55 block">평균 만족도</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Star className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />
                <span className="font-serif text-3xl font-semibold text-[#171717]">
                  {overallAvg}
                </span>
                <span className="text-xs font-mono text-[#171717]/50">/ 5.0</span>
              </div>
            </div>
            <div className="h-10 w-px bg-black/10" />
            <div>
              <span className="text-[11px] font-mono text-[#171717]/55 block">전체 후기</span>
              <span className="font-serif text-3xl font-semibold text-[#171717] block mt-0.5">
                {reviews.length}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 min-[1025px]:grid-cols-12 gap-8 items-start">
          {/* Left 4 cols: Unified Write Review Panel */}
          <div className="min-[1025px]:col-span-4 bg-white/80 rounded-2xl border border-black/10 p-6 min-[601px]:p-7">
            <h3 className="font-serif text-2xl text-[#171717] font-medium mb-1">
              후기 작성하기
            </h3>
            <p className="text-xs text-[#171717]/65 mb-5 leading-relaxed break-keep">
              직접 경험한 탬버린즈 향수의 첫인상과 잔향, 지속력을 다른 고객들과 나누어 보세요.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-[#171717]/65 mb-1.5">
                  제품 선택
                </label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F5F4EF] border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                >
                  {COLLECTION_ITEMS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.koreanName}) · {item.volume}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#171717]/65 mb-1.5">
                  별점 평가
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`${star}점 선택`}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating
                            ? 'fill-[#D4AF37] text-[#D4AF37]'
                            : 'text-black/20'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono tabular-nums text-[#171717]/75 ml-2">
                    {rating}.0 / 5.0
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#171717]/65 mb-1.5">
                  향기 인상 태그
                </label>
                <select
                  value={scentTag}
                  onChange={(e) => setScentTag(e.target.value as ReviewScentTag)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F5F4EF] border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                >
                  {REVIEW_SCENT_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#171717]/65 mb-1.5">
                  작성자 이름
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="이름 또는 닉네임"
                  maxLength={24}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F5F4EF] border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#171717]/65 mb-1.5">
                  감상평
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="향기의 분위기, 잔향, 추천 계절 등을 자유롭게 남겨주세요."
                  maxLength={400}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F5F4EF] border border-black/15 rounded-xl focus:outline-none focus:border-[#171717] resize-none"
                />
              </div>

              {formError && <p className="text-xs text-red-700 font-medium">{formError}</p>}
              {submitSuccess && (
                <p className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>고객 후기가 정상적으로 등록되었습니다.</span>
                </p>
              )}

              <button
                type="submit"
                className="w-full min-h-[44px] py-3 bg-[#171717] text-white text-xs font-medium tracking-wider rounded-full hover:bg-black transition-colors cursor-pointer"
              >
                후기 등록하기
              </button>
            </form>
          </div>

          {/* Right 8 cols: Filter Bar + Review Cards */}
          <div className="min-[1025px]:col-span-8 space-y-6">
            {/* Minimalist Filter & Sort Controls */}
            <div className="flex items-center justify-between gap-2 min-[601px]:gap-3 border-b border-black/10 pb-3">
              <div className="flex items-center gap-0.5 min-[601px]:gap-1 bg-white/60 p-1 rounded-full border border-black/10">
                {REVIEW_CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 min-[601px]:px-4 py-1.5 text-xs rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#171717] text-white font-medium'
                          : 'text-[#171717]/70 hover:text-[#171717]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'rating')}
                aria-label="후기 정렬 기준"
                className="px-3 py-1.5 text-xs bg-white/75 border border-black/12 rounded-full focus:outline-none focus:border-[#171717] cursor-pointer shrink-0"
              >
                <option value="newest">최신순</option>
                <option value="rating">별점순</option>
              </select>
            </div>

            {/* Review Cards Grid */}
            {filteredReviews.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white/60 border border-black/10 text-xs text-[#171717]/60">
                선택하신 카테고리에 아직 등록된 후기가 없습니다. 왼쪽 폼에서 첫 후기를 작성해 보세요.
              </div>
            ) : (
              <div className="grid grid-cols-1 min-[601px]:grid-cols-2 gap-4">
                {filteredReviews.map((rev) => {
                  const product = COLLECTION_ITEMS.find((p) => p.id === rev.productId);
                  const isHelpful = helpfulIds.includes(rev.id);

                  return (
                    <article
                      key={rev.id}
                      className="p-5 rounded-2xl bg-white/80 border border-black/10 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        {/* Header: Product Mini Thumb + Rating */}
                        <div className="flex items-center justify-between gap-3">
                          {product && (
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-11 aspect-[4/3] rounded-lg overflow-hidden border border-black/10 shrink-0">
                                <ProductImage
                                  visualKey={product.visualKey}
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="font-serif text-sm font-semibold text-[#171717] truncate">
                                  {product.name}
                                </div>
                                <div className="text-[11px] font-mono text-[#171717]/55 truncate">
                                  {product.koreanName} · {product.volume}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-0.5 shrink-0">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating
                                    ? 'fill-[#D4AF37] text-[#D4AF37]'
                                    : 'text-black/15'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Review Comment */}
                        <p className="text-xs text-[#171717]/80 leading-relaxed break-keep">
                          {rev.comment}
                        </p>
                      </div>

                      {/* Footer Metadata */}
                      <div className="pt-3 border-t border-black/8 flex items-center justify-between gap-2 text-[11px] font-mono text-[#171717]/55">
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 min-w-0">
                          <span className="font-medium text-[#171717]/80 whitespace-nowrap">{rev.authorName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="whitespace-nowrap">{rev.scentTag}</span>
                          {rev.verifiedPurchase && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-800 whitespace-nowrap">구매인증</span>
                            </>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => onToggleHelpful(rev.id)}
                          className={`inline-flex items-center gap-1 cursor-pointer transition-colors shrink-0 tabular-nums ${
                            isHelpful ? 'text-[#171717] font-semibold' : 'hover:text-[#171717]'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{rev.helpfulCount}</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
