import React, { useState, useEffect } from 'react';
import { CartItem, CustomerInfo, MemberUser, OrderRecord, PaymentMethod } from '../types.ts';
import { COLLECTION_ITEMS, formatKRW } from '../data/scents.ts';
import { ProductImage } from './ProductImage.tsx';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, Receipt, ArrowLeft } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  orders: OrderRecord[];
  currentUser?: MemberUser | null;
  onClose: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCompleteOrder: (customer: CustomerInfo) => OrderRecord;
  onOpenProductForReview: (productId: string) => void;
}

type DrawerStep = 'bag' | 'checkout' | 'receipt' | 'history';

const FREE_SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 3000;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cart,
  orders,
  currentUser,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCompleteOrder,
  onOpenProductForReview
}) => {
  const [step, setStep] = useState<DrawerStep>('bag');
  const [latestOrder, setLatestOrder] = useState<OrderRecord | null>(null);
  const [formError, setFormError] = useState<string>('');

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('신용/체크카드');

  useEffect(() => {
    if (isOpen) {
      setFormError('');
      if (step === 'receipt' && !latestOrder) {
        setStep('bag');
      }
      if (currentUser) {
        setName((prev) => prev || currentUser.name);
        if (currentUser.phone) setPhone((prev) => prev || currentUser.phone!);
        if (currentUser.address) setAddress((prev) => prev || currentUser.address!);
      }
    }
  }, [isOpen, step, latestOrder, currentUser]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const detailedItems = cart
    .map((ci) => {
      const product = COLLECTION_ITEMS.find((p) => p.id === ci.productId);
      return product ? { ...ci, product } : null;
    })
    .filter((x): x is { productId: string; quantity: number; product: (typeof COLLECTION_ITEMS)[number] } => x !== null);

  const subtotal = detailedItems.reduce(
    (sum, item) => sum + item.product.priceKRW * item.quantity,
    0
  );
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('수령인 성함을 입력해 주세요.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setFormError('올바른 연락처를 입력해 주세요.');
      return;
    }
    if (!address.trim() || address.trim().length < 5) {
      setFormError('배송받으실 주소를 상세히 입력해 주세요.');
      return;
    }

    const order = onCompleteOrder({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      memo: memo.trim() || '문 앞에 놓아주세요',
      paymentMethod
    });

    setLatestOrder(order);
    setFormError('');
    setStep('receipt');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="쇼핑백 및 주문 결제"
    >
      <aside
        className="w-full max-w-md bg-[#F5F4EF] h-full shadow-2xl border-l border-black/15 flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-black/10 flex items-center justify-between bg-[#F5F4EF]">
          <div className="flex items-center gap-3">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('bag')}
                aria-label="쇼핑백으로 돌아가기"
                className="p-1.5 rounded-full hover:bg-black/5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="font-serif text-2xl text-[#171717] font-medium">
                {step === 'bag' && 'Shopping Bag'}
                {step === 'checkout' && 'Checkout'}
                {step === 'receipt' && 'Order Confirmed'}
                {step === 'history' && 'Order History'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {orders.length > 0 && step !== 'history' && (
              <button
                type="button"
                onClick={() => setStep('history')}
                className="text-[11px] font-mono underline underline-offset-2 text-[#171717]/70 hover:text-[#171717] cursor-pointer px-2 py-1 tabular-nums"
              >
                주문내역 ({orders.length})
              </button>
            )}
            {step === 'history' && (
              <button
                type="button"
                onClick={() => setStep('bag')}
                className="text-[11px] font-mono underline underline-offset-2 text-[#171717]/70 hover:text-[#171717] cursor-pointer px-2 py-1"
              >
                쇼핑백으로
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="쇼핑백 닫기"
              className="w-9 h-9 rounded-full border border-black/15 flex items-center justify-center hover:bg-[#171717] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {step === 'bag' && (
            <>
              {/* Free shipping progress */}
              <div className="p-4 rounded-2xl bg-[#EFECE6] border border-black/8 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#171717]/80">
                    {remainingForFreeShipping === 0 && subtotal > 0
                      ? '무료 배송 혜택이 적용되었습니다.'
                      : `${formatKRW(FREE_SHIPPING_THRESHOLD)} 이상 구매 시 무료 배송`}
                  </span>
                  {subtotal > 0 && remainingForFreeShipping > 0 && (
                    <span className="tabular-nums text-[#171717] font-medium">
                      +{formatKRW(remainingForFreeShipping)}
                    </span>
                  )}
                </div>
                <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#171717] rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {detailedItems.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#EFECE6] flex items-center justify-center mx-auto text-[#171717]/40">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-[#171717]">쇼핑백이 비어 있습니다.</p>
                  <p className="text-xs text-[#171717]/60 break-keep">
                    컬렉션에서 마음에 드는 향수를 선택해 담아보세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {detailedItems.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="p-3.5 rounded-2xl bg-white/85 border border-black/10 flex gap-3.5 items-center"
                    >
                      <div className="w-20 aspect-[4/3] rounded-xl overflow-hidden border border-black/5 shrink-0">
                        <ProductImage
                          visualKey={product.visualKey}
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-serif text-base font-semibold text-[#171717] truncate">
                              {product.name}
                            </h4>
                            <p className="text-[11px] font-mono text-[#171717]/55">
                              {product.koreanName} · {product.volume}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(product.id)}
                            aria-label={`${product.name} 삭제`}
                            className="p-1 text-[#171717]/40 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="inline-flex items-center border border-black/15 rounded-full bg-[#F5F4EF]">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(product.id, -1)}
                              className="w-7 h-7 flex items-center justify-center text-xs hover:bg-black/5 rounded-l-full cursor-pointer"
                              aria-label="수량 감소"
                            >
                              −
                            </button>
                            <span className="w-7 text-center text-xs font-mono tabular-nums">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(product.id, 1)}
                              className="w-7 h-7 flex items-center justify-center text-xs hover:bg-black/5 rounded-r-full cursor-pointer"
                              aria-label="수량 증가"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-sm font-semibold text-[#171717] tabular-nums">
                            {formatKRW(product.priceKRW * quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#EFECE6] border border-black/10 space-y-2">
                <span className="text-[11px] font-mono text-[#171717]/60 block">주문 상품 요약</span>
                {detailedItems.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex justify-between text-xs text-[#171717] tabular-nums"
                  >
                    <span>
                      {product.name} ({product.volume}) × {quantity}
                    </span>
                    <span className="font-medium">
                      {formatKRW(product.priceKRW * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {currentUser && (
                <div className="px-3.5 py-2 rounded-xl bg-white/80 border border-black/10 flex items-center justify-between text-[11px] text-[#171717]/75">
                  <span>
                    <strong className="text-[#171717]">{currentUser.name}님</strong> 회원 정보 적용됨
                  </span>
                  <span className="font-mono text-[10px] text-[#171717]/50">{currentUser.email}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-[#171717]/65 mb-1">
                  수령인 성함 *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#171717]/65 mb-1">
                  연락처 *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#171717]/65 mb-1">
                  배송지 주소 *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="서울시 강남구 압구정로 ... 상세주소"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#171717]/65 mb-1">
                  배송 요청사항
                </label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="예: 문 앞에 놓아주세요 / 선물 포장 요청"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#171717]/65 mb-1.5">
                  결제 수단
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['신용/체크카드', '간편결제', '무통장입금'] as PaymentMethod[]).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2.5 px-2 text-[11px] rounded-xl border transition-colors cursor-pointer ${
                        paymentMethod === method
                          ? 'bg-[#171717] text-white border-[#171717]'
                          : 'bg-white border-black/15 text-[#171717]/80 hover:border-black'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {formError && <p className="text-xs text-red-700 font-medium">{formError}</p>}
            </form>
          )}

          {step === 'receipt' && latestOrder && (
            <div className="space-y-5 py-2">
              <div className="p-5 rounded-2xl bg-white border border-black/10 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
                <div className="text-xs font-mono text-[#171717]/55 uppercase">
                  Order #{latestOrder.orderId}
                </div>
                <h3 className="font-serif text-2xl text-[#171717] font-medium">
                  주문이 완료되었습니다
                </h3>
                <p className="text-xs text-[#171717]/70 break-keep">
                  {latestOrder.customer.name}님, 정성껏 포장하여 안전하게 배송해 드리겠습니다.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#EFECE6] border border-black/10 space-y-3 text-xs">
                <div className="font-mono text-[11px] text-[#171717]/60 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>주문 상세 내역</span>
                </div>

                <div className="space-y-2 border-t border-black/10 pt-2">
                  {latestOrder.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between gap-2 tabular-nums"
                    >
                      <div>
                        <span className="font-medium text-[#171717]">
                          {item.name} ({item.volume})
                        </span>
                        <span className="text-[#171717]/55 ml-1.5">× {item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{formatKRW(item.priceKRW * item.quantity)}</span>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenProductForReview(item.productId);
                          }}
                          className="text-[11px] underline text-[#171717]/70 hover:text-[#171717] cursor-pointer"
                        >
                          후기 작성
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-black/10 pt-2 space-y-1 tabular-nums text-[#171717]/75">
                  <div className="flex justify-between">
                    <span>배송지</span>
                    <span className="text-right max-w-[60%] break-keep">
                      {latestOrder.customer.address}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>결제 수단</span>
                    <span>{latestOrder.customer.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[#171717] pt-1 text-sm">
                    <span>최종 결제 금액</span>
                    <span>{formatKRW(latestOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('bag');
                  onClose();
                }}
                className="w-full py-3 bg-[#171717] text-white text-xs tracking-wider rounded-full hover:bg-black transition-colors cursor-pointer"
              >
                쇼핑 계속하기
              </button>
            </div>
          )}

          {step === 'history' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-xs text-center text-[#171717]/60 py-10">
                  완료된 주문 내역이 없습니다.
                </p>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className="p-4 rounded-2xl bg-white/85 border border-black/10 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-semibold text-[#171717]">#{ord.orderId}</span>
                      <span className="text-[#171717]/55">{ord.createdAt}</span>
                    </div>
                    <div className="text-[11px] text-emerald-800 font-medium">{ord.status}</div>
                    <div className="border-t border-black/8 pt-2 space-y-1.5">
                      {ord.items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between tabular-nums"
                        >
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenProductForReview(item.productId);
                            }}
                            className="text-[11px] underline text-[#171717]/70 hover:text-[#171717] cursor-pointer"
                          >
                            리뷰 남기기
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-black/8 pt-2 flex justify-between font-semibold tabular-nums">
                      <span>총 결제 금액</span>
                      <span>{formatKRW(ord.totalAmount)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer Totals & Action */}
        {(step === 'bag' || step === 'checkout') && detailedItems.length > 0 && (
          <div className="px-6 py-5 border-t border-black/10 bg-[#EFECE6] space-y-3">
            <div className="space-y-1.5 text-xs tabular-nums">
              <div className="flex justify-between text-[#171717]/70">
                <span>상품 합계</span>
                <span>{formatKRW(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#171717]/70">
                <span>배송비</span>
                <span>{shipping === 0 ? '무료' : formatKRW(shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-[#171717] pt-1.5 border-t border-black/10">
                <span>총 결제 금액</span>
                <span>{formatKRW(total)}</span>
              </div>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full min-h-[46px] py-3.5 bg-[#171717] text-white text-xs font-medium tracking-wider rounded-full hover:bg-black transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>주문서 작성하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                className="w-full min-h-[46px] py-3.5 bg-[#171717] text-white text-xs font-medium tracking-wider rounded-full hover:bg-black transition-colors cursor-pointer tabular-nums"
              >
                {formatKRW(total)} 결제 완료하기
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};
