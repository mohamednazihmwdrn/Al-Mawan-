import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'mobileMenu';
  onAfterAction?: () => void;
}

const IOSInstallGuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    <div
      className="w-full max-w-sm rounded-2xl bg-white text-slate-800 p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <img
            src="/pwa-192x192.png"
            alt="شعار متجر الموان"
            className="w-12 h-12 rounded-2xl shadow-md border border-slate-200 object-cover bg-white"
          />
          <div>
            <h3 className="text-base font-black text-slate-900">تثبيت تطبيق الموان على الآيفون</h3>
            <p className="text-xs text-slate-500 font-medium">يعمل كتطبيق كامل بأيقونة على الشاشة الرئيسية</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs sm:text-sm text-slate-700">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-[#163674] text-white font-black flex items-center justify-center shrink-0 text-xs">
            1
          </span>
          <p className="font-semibold flex items-center gap-1.5 flex-wrap">
            اضغط على زر <strong className="text-[#163674]">المشاركة (Share)</strong>
            <Share className="w-4 h-4 text-blue-600 inline" />
            في شريط متصفح Safari بالأسفل.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-[#163674] text-white font-black flex items-center justify-center shrink-0 text-xs">
            2
          </span>
          <p className="font-semibold flex items-center gap-1.5 flex-wrap">
            مرر للأسفل واختر <strong className="text-[#163674]">إضافة إلى الشاشة الرئيسية</strong>
            <PlusSquare className="w-4 h-4 text-slate-700 inline" />
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
            3
          </span>
          <p className="font-semibold flex items-center gap-1.5">
            اضغط <strong className="text-emerald-700">إضافة (Add)</strong> ليظهر التطبيق على هاتفك!
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="mt-4 w-full py-2.5 rounded-xl bg-[#163674] hover:bg-[#10295a] text-white font-black text-sm transition-colors"
      >
        حسناً، فهمت
      </button>
    </div>
  </div>
);

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  onAfterAction,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      onAfterAction?.();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (variant === 'mobileMenu') {
    return (
      <>
        <button
          onClick={handleClick}
          className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>تثبيت تطبيق الموان على الهاتف</span>
        </button>
        {showIOSGuide && <IOSInstallGuideModal onClose={() => setShowIOSGuide(false)} />}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/15 hover:bg-white/25 text-amber-300 border border-amber-400/40 font-black text-xs shadow-sm transition-all active:scale-95"
        title="تثبيت متجر الموان كتطبيق على هاتفك"
      >
        <Smartphone className="w-4 h-4 shrink-0" />
        <span className="hidden lg:inline">تثبيت التطبيق</span>
        <span className="lg:hidden text-[11px]">تثبيت</span>
      </button>

      {showIOSGuide && <IOSInstallGuideModal onClose={() => setShowIOSGuide(false)} />}
    </>
  );
};

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('mawan_pwa_banner_dismissed') === '1';
    } catch {
      return false;
    }
  });
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled || dismissed || (!isInstallable && !isIOS)) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('mawan_pwa_banner_dismissed', '1');
    } catch {
      // Ignore storage failures
    }
  };

  const handleInstall = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <div
        className="fixed bottom-4 right-3 left-20 sm:left-auto sm:right-6 sm:w-96 z-40 bg-white/95 backdrop-blur-md border-2 border-[#163674]/20 rounded-2xl shadow-2xl p-3 flex items-center gap-3 animate-in slide-in-from-bottom duration-300"
        dir="rtl"
      >
        <img
          src="/pwa-192x192.png"
          alt="تطبيق متجر الموان"
          className="w-12 h-12 rounded-xl shadow border border-slate-200 shrink-0 bg-white object-cover"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
              الموان
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          </div>
          <p className="text-[11px] text-slate-600 font-medium truncate">
            ثبّت المتجر على هاتفك لفتح أسرع بدون متصفح
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-xl bg-[#163674] hover:bg-[#0f2858] text-white font-black text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="إخفاء"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSGuide && <IOSInstallGuideModal onClose={() => setShowIOSGuide(false)} />}
    </>
  );
};
