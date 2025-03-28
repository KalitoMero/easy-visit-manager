
import React, { useEffect } from 'react';
import NavButton from '@/components/NavButton';
import { Card, CardContent } from '@/components/ui/card';
import { initializeAutoCheckout, useVisitorStore } from '@/hooks/useVisitorStore';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTranslation } from '@/locale/translations';

const Index = () => {
  const { language } = useLanguageStore();
  const t = useTranslation(language);

  useEffect(() => {
    // Set up automatic checkout at 8 PM
    const cleanupAutoCheckout = initializeAutoCheckout();
    
    // Try to also perform scheduled checkout if it hasn't been done today
    // This will help recover from PC shutdown situations
    setTimeout(() => {
      useVisitorStore.getState().performScheduledCheckout();
    }, 2000);
    
    return () => cleanupAutoCheckout();
  }, []);

  return (
    <div className="app-container">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div className="page-container min-h-[600px]">
        <div className="flex-1 flex flex-col items-center justify-center text-center mb-12 mt-8">
          <h1 className="text-4xl font-bold mb-6 tracking-tight">
            {t('welcome')}
          </h1>
          <Card className="w-full max-w-2xl bg-white/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <p className="text-xl leading-relaxed">
                {t('welcomeMessage')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="w-full flex justify-between items-center gap-4 mb-6">
          <NavButton to="/admin" position="left" variant="outline">
            {t('admin')}
          </NavButton>
          
          <NavButton 
            to="/checkin/step1" 
            position="center"
            className="px-10 py-7 text-xl"
          >
            {t('selfCheckIn')}
          </NavButton>
          
          <NavButton 
            to="/checkout" 
            position="right" 
            variant="secondary"
            className="px-10 py-7 text-xl"
          >
            {t('checkOut')}
          </NavButton>
        </div>
      </div>
    </div>
  );
};

export default Index;
