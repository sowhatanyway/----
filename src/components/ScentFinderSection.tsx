import React, { useState } from 'react';
import { ScentKey } from '../types.ts';
import { QUIZ_QUESTIONS, SCENT_CONFIGS, COLLECTION_ITEMS, formatKRW } from '../data/scents.ts';
import { ProductImage } from './ProductImage.tsx';
import { playQuizSelectAudio } from '../utils/audio.ts';
import { Sparkles, RotateCcw, ShoppingBag, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ScentFinderSectionProps {
  onSelectAndSpray: (key: ScentKey) => void;
  onAddToCart: (productId: string) => void;
  soundEnabled: boolean;
}

export const ScentFinderSection: React.FC<ScentFinderSectionProps> = ({
  onSelectAndSpray,
  onAddToCart,
  soundEnabled
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<number, ScentKey>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const totalSteps = QUIZ_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;

  const handleSelectOption = (step: number, key: ScentKey) => {
    playQuizSelectAudio(soundEnabled);
    const updated = { ...answers, [step]: key };
    setAnswers(updated);

    // Move to next unanswered question, or complete when all 3 are answered
    const nextSteps = [1, 2, 3].filter((s) => s > step).concat([1, 2, 3].filter((s) => s < step));
    const nextUnanswered = nextSteps.find((s) => !updated[s]);

    if (nextUnanswered !== undefined) {
      setCurrentStep(nextUnanswered);
    } else if (Object.keys(updated).length >= totalSteps) {
      setIsCompleted(true);
    } else if (step < totalSteps) {
      setCurrentStep(step + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else if (answeredCount > 0) {
      setIsCompleted(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(1);
    setIsCompleted(false);
  };

  const counts: Record<ScentKey, number> = { chamo: 0, pumkini: 0, evening: 0, metal: 0 };
  Object.values(answers).forEach((k) => {
    if (k) counts[k] = (counts[k] || 0) + 1;
  });

  let bestScentKey: ScentKey = 'chamo';
  let maxCount = -1;
  (Object.keys(counts) as ScentKey[]).forEach((k) => {
    if (counts[k] > maxCount) {
      maxCount = counts[k];
      bestScentKey = k;
    }
  });

  const matchPercents: Record<number, string> = { 3: '98%', 2: '89%', 1: '76%' };
  const matchScore = matchPercents[maxCount] || '85%';
  const matchedScent = SCENT_CONFIGS[bestScentKey];
  const matchedProduct = COLLECTION_ITEMS.find((p) => p.scentKey === bestScentKey);

  const currentQ = QUIZ_QUESTIONS[currentStep - 1];
  const currentSelectedKey = answers[currentStep];

  return (
    <section id="scent-finder" className="py-20 min-[601px]:py-24 px-4 min-[601px]:px-6 min-[1025px]:px-4 bg-[#EFECE6]/60 border-t border-black/5">
      <div className="max-w-[1080px] mx-auto">
        <div className="text-center mb-10 min-[601px]:mb-12">
          <span className="text-[11px] min-[601px]:text-xs tracking-[0.25em] text-[#171717]/60 uppercase block mb-2 font-mono">
            Interactive Quiz
          </span>
          <h2 className="text-[#171717] font-light leading-tight">
            <span className="block font-serif text-3xl min-[601px]:text-4xl min-[1025px]:text-5xl tracking-tight">
              Scent Finder
            </span>
            <span className="block font-sans text-lg min-[601px]:text-2xl min-[1025px]:text-[28px] font-normal text-[#171717]/85 mt-1.5 whitespace-nowrap">
              취향 맞춤 향수 탐색
            </span>
          </h2>
          <p className="text-[13px] min-[601px]:text-sm text-[#171717]/70 mt-3 max-w-lg mx-auto leading-relaxed break-keep text-pretty">
            화살표로 질문을 자유롭게 오가며 답변해 주세요. 당신의 분위기와 잔향 취향에 어울리는 탬버린즈 시그니처 향수를 추천해 드립니다.
          </p>
        </div>

        <div className="glass-card max-w-3xl mx-auto p-6 min-[601px]:p-10 min-[1025px]:p-12 rounded-3xl shadow-lg border border-black/10 transition-all">
          {!isCompleted ? (
            <>
              {/* Step Header with Arrow Navigation */}
              <div className="flex justify-between items-center mb-7 border-b border-black/10 pb-4 gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                    aria-label="이전 질문"
                    title="이전 질문"
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                      currentStep === 1
                        ? 'border-black/10 text-black/25 cursor-not-allowed'
                        : 'border-black/20 text-[#171717] hover:bg-[#171717] hover:text-white cursor-pointer'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono tracking-widest uppercase text-[#171717]/70 tabular-nums whitespace-nowrap">
                    STEP {currentStep} / {totalSteps}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={currentStep === totalSteps && answeredCount === 0}
                    aria-label="다음 질문"
                    title={currentStep < totalSteps ? '다음 질문으로 건너뛰기' : '결과 보기'}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                      currentStep === totalSteps && answeredCount === 0
                        ? 'border-black/10 text-black/25 cursor-not-allowed'
                        : 'border-black/20 text-[#171717] hover:bg-[#171717] hover:text-white cursor-pointer'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Clickable Step Indicators */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((step) => {
                    const isCurrent = currentStep === step;
                    const isAnswered = Boolean(answers[step]);
                    return (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setCurrentStep(step)}
                        aria-label={`${step}번 질문으로 이동`}
                        className={`w-6 h-6 rounded-full text-[10px] font-mono tabular-nums flex items-center justify-center transition-all cursor-pointer border ${
                          isCurrent
                            ? 'bg-[#171717] text-white border-[#171717] scale-105'
                            : isAnswered
                              ? 'bg-[#D4AF37]/25 text-[#171717] border-[#D4AF37]/60'
                              : 'bg-white/60 text-[#171717]/45 border-black/15 hover:border-black/40'
                        }`}
                      >
                        {isAnswered && !isCurrent ? <Check className="w-3 h-3" /> : step}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="transition-all duration-300">
                <h3 className="font-serif text-xl min-[601px]:text-2xl min-[1025px]:text-3xl text-[#171717] mb-6 font-light leading-snug break-keep text-pretty">
                  {currentQ.question}
                </h3>
                <div className="grid grid-cols-1 min-[601px]:grid-cols-2 gap-4">
                  {currentQ.options.map((opt) => {
                    const isChosen = currentSelectedKey === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectOption(currentStep, opt.key)}
                        className={`p-5 text-left rounded-2xl border transition-all group cursor-pointer shadow-sm ${
                          isChosen
                            ? 'bg-[#171717] text-white border-[#171717]'
                            : 'border-black/10 bg-white/75 hover:bg-[#171717] hover:text-white'
                        }`}
                      >
                        <span
                          className={`block text-xs font-mono uppercase mb-1 ${
                            isChosen ? 'text-white/65' : 'text-[#171717]/40 group-hover:text-white/60'
                          }`}
                        >
                          {opt.title}
                        </span>
                        <span className="font-medium text-sm block break-keep">{opt.label}</span>
                        <span
                          className={`text-xs mt-1 block break-keep ${
                            isChosen ? 'text-white/80' : 'text-[#171717]/60 group-hover:text-white/80'
                          }`}
                        >
                          {opt.subLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Navigation Footer */}
              <div className="mt-7 pt-4 border-t border-black/8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className={`inline-flex items-center gap-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    currentStep === 1
                      ? 'text-black/25 cursor-not-allowed'
                      : 'text-[#171717]/75 hover:text-[#171717] cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>이전 선택</span>
                </button>

                <div className="flex items-center gap-3">
                  {answeredCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCompleted(true)}
                      className="px-4 py-1.5 rounded-full bg-[#171717] text-white text-xs font-medium hover:bg-black transition-colors cursor-pointer whitespace-nowrap"
                    >
                      결과 보기 ({answeredCount}/{totalSteps})
                    </button>
                  )}
                  {currentStep < totalSteps && (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#171717] hover:opacity-75 transition-opacity cursor-pointer whitespace-nowrap"
                    >
                      <span>다음 선택</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="transition-all duration-500 text-center py-2">
              <div className="text-xs font-mono uppercase tracking-widest text-[#171717]/60 mb-4 tabular-nums">
                Recommended Fragrance · Match {matchScore}
              </div>

              <div className="w-60 aspect-[4/3] mx-auto my-4 rounded-2xl overflow-hidden shadow-lg border border-black/10">
                <ProductImage
                  visualKey={bestScentKey}
                  alt={`${matchedScent.name} studio photo`}
                  className="w-full h-full"
                />
              </div>

              <h3 className="font-serif text-2xl min-[601px]:text-3xl min-[1025px]:text-4xl text-[#171717] font-medium mt-3 leading-snug break-keep">
                {matchedScent.name}{' '}
                <span className="inline-block whitespace-nowrap font-sans text-lg min-[601px]:text-2xl font-normal text-[#171717]/70">
                  ({matchedScent.koreanName})
                </span>
              </h3>
              {matchedProduct && (
                <p className="text-sm font-mono tabular-nums text-[#171717]/75 mt-1">
                  {matchedProduct.volume} · {formatKRW(matchedProduct.priceKRW)}
                </p>
              )}

              <p className="text-[13px] min-[601px]:text-sm text-[#171717]/80 max-w-lg mx-auto leading-relaxed my-4 font-light break-keep text-pretty">
                {matchedScent.description}
              </p>

              <div className="flex flex-wrap justify-center gap-3 mt-7">
                {matchedProduct && (
                  <button
                    type="button"
                    onClick={() => onAddToCart(matchedProduct.id)}
                    className="px-6 py-3 bg-[#171717] text-white text-xs tracking-wider uppercase rounded-full hover:bg-black transition-all shadow-md cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>장바구니 담기</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSelectAndSpray(bestScentKey)}
                  className="px-6 py-3 border border-[#171717] text-[#171717] text-xs tracking-wider uppercase rounded-full hover:bg-[#171717] hover:text-white transition-all cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>상단에서 분사해보기</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-3 border border-black/20 text-[#171717]/80 text-xs tracking-wider uppercase rounded-full hover:bg-black/5 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>다시 테스트</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
