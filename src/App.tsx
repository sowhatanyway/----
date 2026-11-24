/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import {
  ScentKey,
  CollectionItem,
  CartItem,
  OrderRecord,
  CustomerInfo,
  ProductReview,
  ReviewScentTag,
  MemberUser
} from './types.ts';
import { COLLECTION_ITEMS, INITIAL_REVIEWS, formatKRW } from './data/scents.ts';
import { playChimeAudio } from './utils/audio.ts';
import { Navbar } from './components/Navbar.tsx';
import { HeroSpraySection, HeroSpraySectionRef } from './components/HeroSpraySection.tsx';
import { ScentFinderSection } from './components/ScentFinderSection.tsx';
import { AiFaceMatcherSection } from './components/AiFaceMatcherSection.tsx';
import { SculpturalCollectionSection } from './components/SculpturalCollectionSection.tsx';
import { ReviewsSection } from './components/ReviewsSection.tsx';
import { OfflineEventsAndStoresSection } from './components/OfflineEventsAndStoresSection.tsx';
import { GlitterCanvasSection } from './components/GlitterCanvasSection.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { Footer } from './components/Footer.tsx';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

const STORAGE_KEYS = {
  cart: 'tamburins_cart_v1',
  orders: 'tamburins_orders_v1',
  reviews: 'tamburins_reviews_v1',
  helpful: 'tamburins_helpful_v1',
  users: 'tamburins_users_v1',
  session: 'tamburins_session_v1'
};

async function hashPassword(raw: string): Promise<string> {
  try {
    if (window.crypto?.subtle) {
      const encoded = new TextEncoder().encode(`tamburins_salt::${raw}`);
      const digest = await window.crypto.subtle.digest('SHA-256', encoded);
      return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    // Fallback below when subtle crypto is unavailable
  }
  let hash = 2166136261;
  const salted = `tamburins_salt::${raw}`;
  for (let i = 0; i < salted.length; i++) {
    hash ^= salted.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv_${(hash >>> 0).toString(16)}`;
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [currentScentKey, setCurrentScentKey] = useState<ScentKey>('chamo');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const heroSprayRef = useRef<HeroSpraySectionRef | null>(null);

  // Storefront & Review State
  const [cart, setCart] = useState<CartItem[]>(() => readStorage<CartItem[]>(STORAGE_KEYS.cart, []));
  const [orders, setOrders] = useState<OrderRecord[]>(() =>
    readStorage<OrderRecord[]>(STORAGE_KEYS.orders, [])
  );
  const [reviews, setReviews] = useState<ProductReview[]>(() =>
    readStorage<ProductReview[]>(STORAGE_KEYS.reviews, INITIAL_REVIEWS)
  );
  const [helpfulIds, setHelpfulIds] = useState<string[]>(() =>
    readStorage<string[]>(STORAGE_KEYS.helpful, [])
  );

  // Member Auth State
  const [users, setUsers] = useState<MemberUser[]>(() =>
    readStorage<MemberUser[]>(STORAGE_KEYS.users, [])
  );
  const [sessionUserId, setSessionUserId] = useState<string | null>(() =>
    readStorage<string | null>(STORAGE_KEYS.session, null)
  );
  const currentUser = users.find((u) => u.id === sessionUserId) ?? null;

  // Modal & Drawer State
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [activeModalProduct, setActiveModalProduct] = useState<CollectionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState<boolean>(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
    } catch {
      // Ignore storage quota errors
    }
  }, [orders]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews));
    } catch {
      // Ignore storage quota errors
    }
  }, [reviews]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.helpful, JSON.stringify(helpfulIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [helpfulIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    } catch {
      // Ignore storage quota errors
    }
  }, [users]);

  useEffect(() => {
    try {
      if (sessionUserId) {
        window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sessionUserId));
      } else {
        window.localStorage.removeItem(STORAGE_KEYS.session);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [sessionUserId]);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  };

  const handleSelectScent = (key: ScentKey) => {
    setCurrentScentKey(key);
  };

  const handleSelectAndSpray = (key: ScentKey) => {
    setCurrentScentKey(key);
    const heroElem = document.getElementById('hero');
    if (heroElem) {
      heroElem.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        heroSprayRef.current?.sprayAtCenter();
      }, 650);
    }
  };

  const handleAddToCart = (productId: string, quantity = 1) => {
    const product = COLLECTION_ITEMS.find((item) => item.id === productId);
    if (!product) return;

    setCart((prev) => {
      const existing = prev.find((ci) => ci.productId === productId);
      if (existing) {
        return prev.map((ci) =>
          ci.productId === productId ? { ...ci, quantity: ci.quantity + quantity } : ci
        );
      }
      return [...prev, { productId, quantity }];
    });

    playChimeAudio(soundEnabled);
    setIsCartOpen(true);
    showToast(`${product.name} (${product.koreanName}) 쇼핑백에 담겼습니다.`);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) =>
          ci.productId === productId ? { ...ci, quantity: ci.quantity + delta } : ci
        )
        .filter((ci) => ci.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((ci) => ci.productId !== productId));
  };

  const handleCompleteOrder = (customer: CustomerInfo): OrderRecord => {
    const orderItems = cart
      .map((ci) => {
        const product = COLLECTION_ITEMS.find((p) => p.id === ci.productId);
        if (!product) return null;
        return {
          productId: product.id,
          name: product.name,
          koreanName: product.koreanName,
          volume: product.volume,
          priceKRW: product.priceKRW,
          quantity: ci.quantity,
          imageUrl: product.imageUrl
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const subtotalKRW = orderItems.reduce(
      (sum, item) => sum + item.priceKRW * item.quantity,
      0
    );
    const shippingKRW = subtotalKRW >= 50000 ? 0 : 3000;
    const totalAmount = subtotalKRW + shippingKRW;

    const now = new Date();
    const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));

    const newOrder: OrderRecord = {
      orderId: `TB-${dateStamp}-${randomSuffix}`,
      createdAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`,
      items: orderItems,
      subtotalKRW,
      shippingKRW,
      totalAmount,
      customer,
      status: '결제 완료 · 배송 준비 중'
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    playChimeAudio(soundEnabled);
    showToast(`주문(#${newOrder.orderId})이 완료되었습니다.`);
    return newOrder;
  };

  const handleSubmitReview = (input: {
    productId: string;
    authorName: string;
    rating: number;
    scentTag: ReviewScentTag;
    comment: string;
  }) => {
    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    const hasPurchased = orders.some((ord) =>
      ord.items.some((item) => item.productId === input.productId)
    );

    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      productId: input.productId,
      authorName: input.authorName,
      rating: input.rating,
      scentTag: input.scentTag,
      comment: input.comment,
      createdAt,
      helpfulCount: 0,
      verifiedPurchase: hasPurchased
    };

    setReviews((prev) => [newReview, ...prev]);
    playChimeAudio(soundEnabled);
    showToast('고객 후기가 등록되었습니다.');
  };

  const handleToggleHelpful = (reviewId: string) => {
    const alreadyHelpful = helpfulIds.includes(reviewId);
    setHelpfulIds((prev) =>
      alreadyHelpful ? prev.filter((id) => id !== reviewId) : [...prev, reviewId]
    );
    setReviews((prev) =>
      prev.map((rev) =>
        rev.id === reviewId
          ? {
              ...rev,
              helpfulCount: Math.max(0, rev.helpfulCount + (alreadyHelpful ? -1 : 1))
            }
          : rev
      )
    );
  };

  const handleOpenProductById = (productId: string) => {
    const found = COLLECTION_ITEMS.find((p) => p.id === productId);
    if (found) setActiveModalProduct(found);
  };

  const handleLogin = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { ok: false, error: '가입되지 않은 이메일 주소입니다.' };
    }
    const passwordHash = await hashPassword(password);
    if (found.passwordHash !== passwordHash) {
      return { ok: false, error: '비밀번호가 일치하지 않습니다.' };
    }
    setSessionUserId(found.id);
    playChimeAudio(soundEnabled);
    showToast(`${found.name}님, 환영합니다.`);
    return { ok: true };
  };

  const handleRegister = async (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    const exists = users.some((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (exists) {
      return { ok: false, error: '이미 가입된 이메일 주소입니다.' };
    }
    const now = new Date();
    const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const passwordHash = await hashPassword(input.password);
    const newUser: MemberUser = {
      id: `usr-${Date.now()}`,
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      passwordHash,
      createdAt
    };

    setUsers((prev) => [newUser, ...prev]);
    setSessionUserId(newUser.id);
    playChimeAudio(soundEnabled);
    showToast(`${newUser.name}님, 회원가입이 완료되었습니다.`);
    return { ok: true };
  };

  const handleUpdateProfile = (input: { name: string; phone: string; address: string }) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              name: input.name,
              phone: input.phone || undefined,
              address: input.address || undefined
            }
          : u
      )
    );
    showToast('회원 정보가 업데이트되었습니다.');
  };

  const handleLogout = () => {
    setSessionUserId(null);
    showToast('로그아웃되었습니다.');
  };

  const cartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const activeHeroProduct =
    COLLECTION_ITEMS.find((item) => item.scentKey === currentScentKey) ?? COLLECTION_ITEMS[0];

  const handleMobileFixedBuy = () => {
    const alreadyInBag = cart.some((ci) => ci.productId === activeHeroProduct.id);
    if (!alreadyInBag && cart.length === 0) {
      handleAddToCart(activeHeroProduct.id, 1);
    } else {
      setIsCartOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4EF] text-[#171717] selection:bg-[#171717] selection:text-white relative">
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Sticky Top Bar */}
      <Navbar
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main>
        {/* Section 1: Hero 35mm Film Reel & Colored Mist Spray */}
        <HeroSpraySection
          ref={heroSprayRef}
          currentScentKey={currentScentKey}
          onSelectScent={handleSelectScent}
          soundEnabled={soundEnabled}
        />

        {/* Section 2: Scent Finder 3-Step Preference Quiz */}
        <ScentFinderSection
          onSelectAndSpray={handleSelectAndSpray}
          onAddToCart={(productId) => handleAddToCart(productId, 1)}
          soundEnabled={soundEnabled}
        />

        {/* Section 3: AI Face & Aura Fragrance Matcher */}
        <AiFaceMatcherSection
          onSelectAndSpray={handleSelectAndSpray}
          onAddToCart={(productId) => handleAddToCart(productId, 1)}
          soundEnabled={soundEnabled}
        />

        {/* Section 4: Sculptural Collection Storefront */}
        <SculpturalCollectionSection
          reviews={reviews}
          onSelectAndSpray={handleSelectAndSpray}
          onAddToCart={(productId) => handleAddToCart(productId, 1)}
          onOpenProductModal={(product) => setActiveModalProduct(product)}
        />

        {/* Section 5: Unified Customer Reviews & Impressions */}
        <ReviewsSection
          reviews={reviews}
          helpfulIds={helpfulIds}
          currentUser={currentUser}
          onSubmitReview={handleSubmitReview}
          onToggleHelpful={handleToggleHelpful}
        />

        {/* Section 6: Offline Events, Brand Notices & Live Store Locator */}
        <OfflineEventsAndStoresSection />

        {/* Section 7: Olfactory Twinkle & Glitter Canvas */}
        <GlitterCanvasSection
          currentScentKey={currentScentKey}
          soundEnabled={soundEnabled}
        />
      </main>

      <Footer />

      {/* Per-Product Detail & Review Modal */}
      <ProductDetailModal
        product={activeModalProduct}
        reviews={reviews}
        helpfulIds={helpfulIds}
        currentUser={currentUser}
        onClose={() => setActiveModalProduct(null)}
        onAddToCart={handleAddToCart}
        onSelectAndSpray={handleSelectAndSpray}
        onSubmitReview={handleSubmitReview}
        onToggleHelpful={handleToggleHelpful}
      />

      {/* Right Slide-Over Shopping Bag & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        orders={orders}
        currentUser={currentUser}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCompleteOrder={handleCompleteOrder}
        onOpenProductForReview={handleOpenProductById}
      />

      {/* Login / Sign-up / Member Account Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        currentUser={currentUser}
        orderCount={orders.length}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
      />

      {/* Mobile-only (<=600px) Fixed Bottom Purchase Bar */}
      <div className="min-[601px]:hidden fixed bottom-0 inset-x-0 z-30 bg-[#F5F4EF]/95 backdrop-blur-md border-t border-black/15 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#171717]/55 block truncate">
            {activeHeroProduct.koreanName} · {activeHeroProduct.volume}
          </span>
          <span className="text-sm font-semibold text-[#171717] tabular-nums block truncate">
            {activeHeroProduct.name} · {formatKRW(activeHeroProduct.priceKRW)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleMobileFixedBuy}
          className="px-6 py-2.5 min-h-[44px] rounded-full bg-[#171717] text-white text-xs font-medium tracking-wider hover:bg-black transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-md"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>구매하기</span>
        </button>
      </div>

      {/* Subtle Bottom Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-20 min-[601px]:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#171717] text-white text-xs shadow-xl flex items-center gap-2 whitespace-nowrap max-w-[90vw] truncate"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
