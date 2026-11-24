import React, { useState, useEffect } from 'react';
import { MemberUser } from '../types.ts';
import { X, Eye, EyeOff, User, LogOut, CheckCircle2, Mail, Lock, Phone, MapPin } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: MemberUser | null;
  orderCount: number;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  onRegister: (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  onUpdateProfile: (input: { name: string; phone: string; address: string }) => void;
  onLogout: () => void;
}

type AuthTab = 'login' | 'signup';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  orderCount,
  onClose,
  onLogin,
  onRegister,
  onUpdateProfile,
  onLogout
}) => {
  const [tab, setTab] = useState<AuthTab>('login');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Login Form
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPw, setShowLoginPw] = useState<boolean>(false);

  // Sign-Up Form
  const [signupName, setSignupName] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupConfirm, setSignupConfirm] = useState<string>('');
  const [signupPhone, setSignupPhone] = useState<string>('');
  const [signupAddress, setSignupAddress] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [showSignupPw, setShowSignupPw] = useState<boolean>(false);

  // Profile Edit Form
  const [profileName, setProfileName] = useState<string>('');
  const [profilePhone, setProfilePhone] = useState<string>('');
  const [profileAddress, setProfileAddress] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      if (currentUser) {
        setProfileName(currentUser.name);
        setProfilePhone(currentUser.phone ?? '');
        setProfileAddress(currentUser.address ?? '');
      }
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!isValidEmail(loginEmail)) {
      setErrorMsg('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    if (loginPassword.length < 6) {
      setErrorMsg('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await onLogin(loginEmail.trim().toLowerCase(), loginPassword);
      if (!res.ok) {
        setErrorMsg(res.error ?? '로그인에 실패했습니다.');
      } else {
        setLoginPassword('');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (signupName.trim().length < 2) {
      setErrorMsg('성함을 2자 이상 입력해 주세요.');
      return;
    }
    if (!isValidEmail(signupEmail)) {
      setErrorMsg('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg('비밀번호는 영문/숫자 포함 6자 이상으로 설정해 주세요.');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setErrorMsg('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('서비스 이용약관 및 개인정보 처리방침에 동의해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onRegister({
        name: signupName.trim(),
        email: signupEmail.trim().toLowerCase(),
        password: signupPassword,
        phone: signupPhone.trim() || undefined,
        address: signupAddress.trim() || undefined
      });
      if (!res.ok) {
        setErrorMsg(res.error ?? '회원가입 중 오류가 발생했습니다.');
      } else {
        setSignupPassword('');
        setSignupConfirm('');
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (profileName.trim().length < 2) {
      setErrorMsg('성함은 2자 이상 입력해 주세요.');
      return;
    }
    onUpdateProfile({
      name: profileName.trim(),
      phone: profilePhone.trim(),
      address: profileAddress.trim()
    });
    setSuccessMsg('회원 정보가 저장되었습니다.');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={currentUser ? '회원 정보 및 계정 관리' : '로그인 및 회원가입'}
    >
      <div
        className="w-full max-w-md bg-[#F5F4EF] border border-black/15 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-black/10 flex items-center justify-between bg-[#EFECE6]/70">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#171717]/55 block">
              TAMBURINS Member
            </span>
            <h2 className="font-serif text-2xl text-[#171717] font-medium">
              {currentUser
                ? 'My Account'
                : tab === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="창 닫기"
            className="w-9 h-9 rounded-full border border-black/15 bg-white/80 flex items-center justify-center text-[#171717] hover:bg-[#171717] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {currentUser ? (
            /* Logged-in Account Profile View */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#EFECE6] border border-black/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-[#171717] text-white flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-serif text-lg font-medium text-[#171717] truncate">
                      {currentUser.name}님
                    </div>
                    <div className="text-xs font-mono text-[#171717]/60 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 tabular-nums">
                  <span className="text-[10px] font-mono text-[#171717]/50 block">가입일</span>
                  <span className="text-xs font-mono text-[#171717]/80">
                    {currentUser.createdAt}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center tabular-nums">
                <div className="p-3 rounded-xl bg-white/80 border border-black/8">
                  <span className="text-[11px] font-mono text-[#171717]/55 block">회원 등급</span>
                  <span className="text-sm font-medium text-[#171717]">SIGNATURE</span>
                </div>
                <div className="p-3 rounded-xl bg-white/80 border border-black/8">
                  <span className="text-[11px] font-mono text-[#171717]/55 block">누적 주문</span>
                  <span className="text-sm font-medium text-[#171717]">{orderCount}건</span>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-3.5 pt-2 border-t border-black/10">
                <div className="text-xs font-medium text-[#171717]">
                  기본 배송 및 연락처 정보 (결제 · 리뷰 작성 시 자동 입력)
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#171717]/65 mb-1">
                    성함
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#171717]/65 mb-1">
                    연락처
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[#171717]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#171717]/65 mb-1">
                    기본 배송지
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-[#171717]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="서울시 강남구 압구정로 ..."
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                    />
                  </div>
                </div>

                {errorMsg && <p className="text-xs text-red-700 font-medium">{errorMsg}</p>}
                {successMsg && (
                  <p className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{successMsg}</span>
                  </p>
                )}

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#171717] text-white text-xs font-medium tracking-wider rounded-full hover:bg-black transition-colors cursor-pointer"
                  >
                    정보 저장하기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="px-4 py-2.5 border border-black/20 bg-white/80 text-[#171717] text-xs font-medium rounded-full hover:border-[#171717] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>로그아웃</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Guest: Switchable Login / Sign-up Forms */
            <>
              <div className="grid grid-cols-2 p-1 rounded-full bg-[#EFECE6] border border-black/10">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setErrorMsg('');
                  }}
                  className={`py-2 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                    tab === 'login'
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'text-[#171717]/70 hover:text-[#171717]'
                  }`}
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('signup');
                    setErrorMsg('');
                  }}
                  className={`py-2 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                    tab === 'signup'
                      ? 'bg-[#171717] text-white shadow-xs'
                      : 'text-[#171717]/70 hover:text-[#171717]'
                  }`}
                >
                  회원가입
                </button>
              </div>

              {tab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono text-[#171717]/65 mb-1">
                      이메일
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#171717]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="example@tamburins.com"
                        autoComplete="email"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#171717]/65 mb-1">
                      비밀번호
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-[#171717]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showLoginPw ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="6자 이상 입력"
                        autoComplete="current-password"
                        className="w-full pl-9 pr-10 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPw((v) => !v)}
                        aria-label={showLoginPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#171717]/45 hover:text-[#171717] cursor-pointer"
                      >
                        {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMsg && <p className="text-xs text-red-700 font-medium">{errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[44px] py-3 bg-[#171717] text-white text-xs font-medium tracking-wider rounded-full hover:bg-black transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? '로그인 중...' : '로그인하기'}
                  </button>

                  <p className="text-[11px] text-center text-[#171717]/55 break-keep">
                    아직 회원이 아니신가요?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setTab('signup');
                        setErrorMsg('');
                      }}
                      className="underline text-[#171717] font-medium cursor-pointer"
                    >
                      간편 회원가입
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-mono text-[#171717]/65 mb-1">
                      성함 *
                    </label>
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="홍길동"
                      autoComplete="name"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#171717]/65 mb-1">
                      이메일 *
                    </label>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="example@tamburins.com"
                      autoComplete="email"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-[#171717]/65 mb-1">
                        비밀번호 *
                      </label>
                      <div className="relative">
                        <input
                          type={showSignupPw ? 'text' : 'password'}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="6자 이상"
                          autoComplete="new-password"
                          className="w-full pl-3.5 pr-9 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPw((v) => !v)}
                          aria-label={showSignupPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#171717]/45 hover:text-[#171717] cursor-pointer"
                        >
                          {showSignupPw ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[#171717]/65 mb-1">
                        비밀번호 확인 *
                      </label>
                      <input
                        type={showSignupPw ? 'text' : 'password'}
                        value={signupConfirm}
                        onChange={(e) => setSignupConfirm(e.target.value)}
                        placeholder="다시 입력"
                        autoComplete="new-password"
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#171717]/65 mb-1">
                      연락처 (선택)
                    </label>
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="010-1234-5678"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#171717]/65 mb-1">
                      기본 배송지 (선택)
                    </label>
                    <input
                      type="text"
                      value={signupAddress}
                      onChange={(e) => setSignupAddress(e.target.value)}
                      placeholder="서울시 강남구 압구정로 ... 상세주소"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-black/15 rounded-xl focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 accent-[#171717] cursor-pointer"
                    />
                    <span className="text-[11px] text-[#171717]/75 leading-snug break-keep">
                      [필수] 서비스 이용약관 및 개인정보 처리방침에 동의합니다. (브라우저 로컬 저장소에 안전하게 보관됩니다)
                    </span>
                  </label>

                  {errorMsg && <p className="text-xs text-red-700 font-medium">{errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full min-h-[44px] py-3 bg-[#171717] text-white text-xs font-medium tracking-wider rounded-full hover:bg-black transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? '가입 처리 중...' : '회원가입 완료하기'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
