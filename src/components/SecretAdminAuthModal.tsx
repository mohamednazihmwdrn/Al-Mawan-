import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { OWNER_ADMIN_EMAIL } from '../firebase';
import {
  Lock,
  KeyRound,
  X,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const SecretAdminAuthModal: React.FC = () => {
  const {
    isSecretModalOpen,
    setIsSecretModalOpen,
    verifyOwnerPassword,
    isFirebaseAdmin,
    firebaseUserEmail,
    isAuthBusy,
    authError,
    clearAuthError,
    loginOwnerWithGoogle,
    loginOwnerWithRedirect,
    setActiveView,
    showToast
  } = useStore();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If both PIN and Firebase Owner Auth become verified while modal is open, enter Admin Dashboard seamlessly
  useEffect(() => {
    if (isSecretModalOpen && pinVerified && isFirebaseAdmin) {
      setActiveView('admin');
      setIsSecretModalOpen(false);
      setPassword('');
      setPinVerified(false);
      setErrorMsg('');
      showToast('أهلاً بك! تم فتح لوحة تحكم المالك بصلاحيات النشر الحصرية.');
    }
  }, [isSecretModalOpen, pinVerified, isFirebaseAdmin, setActiveView, setIsSecretModalOpen, showToast]);

  if (!isSecretModalOpen) return null;

  const resetAndClose = () => {
    setIsSecretModalOpen(false);
    setPassword('');
    setPinVerified(false);
    setErrorMsg('');
    clearAuthError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const success = await verifyOwnerPassword(password);
    setIsLoading(false);

    if (!success) {
      setErrorMsg('كلمة المرور غير صحيحة! الدخول مخصص لمالك المتجر فقط.');
      setPassword('');
      setPinVerified(false);
      return;
    }

    setPinVerified(true);

    if (isFirebaseAdmin) {
      setActiveView('admin');
      resetAndClose();
      showToast('أهلاً بك! تم فتح لوحة تحكم مالك متجر الموان بنجاح.');
    }
  };

  const handleGooglePopupClick = () => {
    // Call loginOwnerWithGoogle synchronously on user click so mobile/desktop browsers never block the popup
    void loginOwnerWithGoogle();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">بوابة مالك المتجر المحمية</h3>
              <p className="text-xs text-blue-200">النشر والتعديل حصري للمالك فقط</p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetAndClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <KeyRound className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-900">التحقق الثنائي لمالك المتجر</h4>
            <p className="text-xs text-slate-500">
              قواعد الحماية تمنع أي شخص آخر من نشر أو تعديل المنتجات أو الاطلاع على الطلبات.
            </p>
          </div>

          {(errorMsg || authError) && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2 leading-relaxed">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg || authError}</span>
            </div>
          )}

          {/* Step 1: Secret PIN */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">
                1. رمز الدخول السري للمالك:
              </label>
              {pinVerified && (
                <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  تم التحقق
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="أدخل كلمة المرور"
                dir="ltr"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3.5 text-center font-mono text-base font-black tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Step 2: Verified Google Owner Account */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-700 block">
              2. تأكيد هوية المالك في قاعدة البيانات ({OWNER_ADMIN_EMAIL}):
            </label>

            {isFirebaseAdmin ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-black">حساب المالك موثّق ومفعّل</div>
                  <div className="text-[11px] text-emerald-700 truncate" dir="ltr">
                    {firebaseUserEmail}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isAuthBusy}
                  onClick={handleGooglePopupClick}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>
                    {isAuthBusy
                      ? 'جاري التحقق من حساب جوجل...'
                      : 'توثيق حساب المالك بجوجل الآن'}
                  </span>
                </button>

                {authError && (
                  <button
                    type="button"
                    disabled={isAuthBusy}
                    onClick={() => void loginOwnerWithRedirect()}
                    className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>بديل للموبايل: تسجيل الدخول بإعادة التوجيه</span>
                  </button>
                )}

                {pinVerified && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2.5 font-bold text-center">
                    تم قبول الرمز السري! اضغط الآن على زر «توثيق حساب المالك بجوجل» أعلاه لفتح اللوحة بصلاحيات النشر.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={resetAndClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>
                {isLoading
                  ? 'جاري التحقق...'
                  : isFirebaseAdmin
                  ? 'تأكيد ودخول اللوحة'
                  : 'تحقق من الرمز السري'}
              </span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
