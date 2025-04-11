
import React, { useEffect } from 'react';
import NavButton from '@/components/NavButton';
import { Card, CardContent } from '@/components/ui/card';
import { initializeAutoCheckout, useVisitorStore } from '@/hooks/useVisitorStore';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTranslation } from '@/locale/translations';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const Index = () => {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const visitors = useVisitorStore((state) => state.visitors);

  useEffect(() => {
    // Log visitors on initial load
    console.log("Initial visitor data:", visitors);
    
    // Set up automatic checkout at 8 PM
    const cleanupAutoCheckout = initializeAutoCheckout();
    
    // Try to also perform scheduled checkout if it hasn't been done today
    // This will help recover from PC shutdown situations
    setTimeout(() => {
      useVisitorStore.getState().performScheduledCheckout();
    }, 2000);
    
    return () => cleanupAutoCheckout();
  }, [visitors]);

  return (
    <div className="app-container">
      <div className="page-container min-h-[600px]">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted transition-colors"
            asChild
            aria-label={t('admin')}
            title={t('admin')}
          >
            <Link to="/admin">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <LanguageSwitcher />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center mb-12 mt-8">
          <h1 className="text-4xl font-bold mb-6 tracking-tight">
            {language === 'de' ? 'Willkommen bei Leuka' : 'Welcome to Leuka'}
          </h1>
          <Card className="w-full max-w-2xl bg-white/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <p className="text-xl leading-relaxed">
                {language === 'de' 
                  ? 'Wir freuen uns über Ihren Besuch. Sie können sich entweder hier am Tablet selber anmelden oder auf die Rezeption zugehen. Viel Erfolg bei Ihrem Besuch!'
                  : 'We are glad about your visit. You can either register yourself here on the tablet or approach the reception. We wish you success during your visit!'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="w-full flex justify-between items-center gap-4 mb-6">
          <div className="mr-auto"></div>
          
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
