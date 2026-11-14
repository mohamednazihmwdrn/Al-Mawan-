import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { ValueProps } from './components/ValueProps';
import { ActionCards } from './components/ActionCards';
import { CategoryCircles } from './components/CategoryCircles';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailsPage } from './components/ProductDetailsPage';
import { BrandsSection } from './components/BrandsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { PaintStudioModal } from './components/PaintStudioModal';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Toast } from './components/Toast';
import { AdminDashboard } from './components/AdminDashboard';
import { SecretAdminAuthModal } from './components/SecretAdminAuthModal';
import { PWAInstallBanner } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

const MainLayout: React.FC = () => {
  const { activeView, isOwnerAuthenticated, selectedProduct, settings } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8fb] text-slate-800 font-['Cairo',sans-serif] selection:bg-amber-400 selection:text-slate-950">
      {/* View routing: Protected Admin Dashboard, Product Details Page, or Customer Storefront */}
      {activeView === 'admin' && isOwnerAuthenticated ? (
        <AdminDashboard />
      ) : (
        <main className="flex-1 flex flex-col">
          <Header />
          {activeView === 'product' && selectedProduct ? (
            <ProductDetailsPage />
          ) : (
            <>
              {settings.showHeroBanner !== false && <HeroSlider />}
              {settings.showValueProps !== false && <ValueProps />}
              {settings.showActionCards !== false && <ActionCards />}
              {settings.showCategories !== false && <CategoryCircles />}
              <ProductGrid />
              {settings.showBrands !== false && <BrandsSection />}
              {settings.showContactSection !== false && <ContactSection />}
            </>
          )}
          <Footer />
        </main>
      )}

      {/* Global Modals & Overlays */}
      <CartDrawer />
      <CheckoutModal />
      <PaintStudioModal />
      <ProductQuickViewModal />
      <FloatingWhatsApp />
      <PWAInstallBanner />
      <OfflineIndicator />
      <Toast />
      <SecretAdminAuthModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
