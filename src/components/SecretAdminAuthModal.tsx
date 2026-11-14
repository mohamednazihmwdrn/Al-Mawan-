import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Lock,
  KeyRound,
  X,
  ShieldAlert,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';

export const SecretAdminAuthModal: React.FC = () => {
  const {
    isSecretModalOpen,
    setIsSecretModalOpen,
    verifyOwnerPassword,
    setActiveView,
    showToast
  } = useStore();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isSecretModalOpen) return null;

  const resetAndClose = () => {
    setIsSecretModalOpen(false);
    setPassword('');
    setErrorMsg('');
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
      return;
    }

    setActiveView('admin');
    resetAndClose();
    showToast('أهلاً بك! تم فتح لوحة تحكم مالك متجر الموان بنجاح.');
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
              <h3 className="text-base font-black">بوابة مالك المتجر</h3>
              <p className="text-xs text-blue-200">الدخول المباشر إلى لوحة التحكم</p>
            </div>
          </div>

          <button
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
            <h4 className="text-sm font-black text-slate-900">أدخل رمز الدخول السري</h4>
            <p className="text-xs text-slate-500">
              يرجى إدخال كلمة سر المالك لإدارة المنتجات والأقسام والأسعار وكتالوجات الألوان مباشرة.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              كلمة مرور المالك:
            </label>
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
              <span>{isLoading ? 'جاري التحقق...' : 'تأكيد ودخول'}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
