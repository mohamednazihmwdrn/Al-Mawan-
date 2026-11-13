import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let cachedDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    cachedDeferredPrompt = e as BeforeInstallPromptEvent;
    promptListeners.forEach((listener) => listener(cachedDeferredPrompt));
  });

  window.addEventListener('appinstalled', () => {
    cachedDeferredPrompt = null;
    promptListeners.forEach((listener) => listener(null));
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    cachedDeferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkStandalone = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsInstalled(checkStandalone());

    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (/macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    const listener = (nextPrompt: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(nextPrompt);
    };
    promptListeners.add(listener);

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      cachedDeferredPrompt = null;
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstalled(true);
    };

    window.addEventListener('appinstalled', handleInstalled);
    mediaQuery.addEventListener?.('change', handleDisplayChange);

    return () => {
      promptListeners.delete(listener);
      window.removeEventListener('appinstalled', handleInstalled);
      mediaQuery.removeEventListener?.('change', handleDisplayChange);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      cachedDeferredPrompt = null;
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}
