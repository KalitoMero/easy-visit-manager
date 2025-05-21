
import React, { useEffect } from 'react';
import NavButton from '@/components/NavButton';
import { Card, CardContent } from '@/components/ui/card';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import useTranslation from '@/locale/translations';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';

const Index = () => {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const visitors = useVisitorStore((state) => state.visitors);
  const performScheduledCheckout = useVisitorStore((state) => state.performScheduledCheckout);
  const performScheduledAutoCheckout = useVisitorStore((state) => state.performScheduledAutoCheckout);
  const autoCheckoutSchedule = useVisitorStore((state) => state.autoCheckoutSchedule);
  const { companyLogo, showBuiltByText } = usePrinterSettings();

  useEffect(() => {
    // Log visitors on initial load
    console.log("Initial visitor data:", visitors);
    
    // Set up automatic checkout based on schedule
    const checkTime = () => {
      const now = new Date();
      
      // Check if auto-checkout is enabled and it's the right time
      if (autoCheckoutSchedule.enabled) {
        if (now.getHours() === autoCheckoutSchedule.hour && 
            Math.floor(now.getMinutes() / 5) === Math.floor(autoCheckoutSchedule.minute / 5)) {
          performScheduledAutoCheckout();
        }
      }
      
      // Legacy 8 PM checkout
      if (now.getHours() === 20) { // 8 PM
        performScheduledCheckout();
      }
    };
    
    const timer = setInterval(checkTime, 5 * 60 * 1000); // Check every 5 minutes
    
    // Try to also perform scheduled checkout if it hasn't been done today
    setTimeout(() => {
      performScheduledCheckout();
      
      // Also check if we should run auto-checkout
      if (autoCheckoutSchedule.enabled) {
        const now = new Date();
        const checkoutTime = new Date();
        checkoutTime.setHours(autoCheckoutSchedule.hour, autoCheckoutSchedule.minute, 0, 0);
        
        // If the scheduled time has already passed today, run checkout
        if (now > checkoutTime) {
          // Check if we already ran today
          const lastRun = autoCheckoutSchedule.lastRun ? new Date(autoCheckoutSchedule.lastRun) : null;
          const today = new Date();
          
          // Only run if we haven't run today yet
          if (!lastRun || 
              lastRun.getDate() !== today.getDate() || 
              lastRun.getMonth() !== today.getMonth() || 
              lastRun.getFullYear() !== today.getFullYear()) {
            performScheduledAutoCheckout();
          }
        }
      }
    }, 2000);
    
    return () => clearInterval(timer);
  }, [visitors, performScheduledCheckout, performScheduledAutoCheckout, autoCheckoutSchedule]);

  return (
    <div className="app-container">
      <div className="page-container min-h-[600px] flex flex-col">
        {/* Header with admin and language controls */}
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
        
        {/* Welcome section */}
        <div className="flex-1 flex flex-col items-center justify-center pt-12">
          <h1 className="text-4xl font-bold mb-6 tracking-tight">
            {language === 'de' ? 'Willkommen bei Leuka' : 'Welcome to Leuka'}
          </h1>
          
          <Card className="w-full max-w-2xl bg-white/50 backdrop-blur-sm mb-8">
            <CardContent className="p-8">
              <p className="text-xl leading-relaxed">
                {language === 'de' 
                  ? 'Wir freuen uns über Ihren Besuch.\n\nSie können sich entweder hier über Touch selber anmelden oder auf die Rezeption zugehen. Viel Erfolg bei Ihrem Besuch!'
                  : 'We are glad about your visit. You can either register yourself here on the tablet or approach the reception. We wish you success during your visit!'}
              </p>
            </CardContent>
          </Card>
          
          {/* Action buttons in a centered, evenly spaced layout */}
          <div className="flex justify-center gap-6 w-full max-w-2xl mb-8">
            <NavButton 
              to="/checkin/step1" 
              className="flex-1 px-8 py-6 text-xl"
            >
              {t('selfCheckIn')}
            </NavButton>
            
            <NavButton 
              to="/checkout" 
              variant="secondary"
              className="flex-1 px-8 py-6 text-xl"
            >
              {t('checkOut')}
            </NavButton>
          </div>
        </div>

        {/* Company logo with built by text */}
        {companyLogo && (
          <div className="fixed bottom-4 right-4 flex items-center gap-2">
            {showBuiltByText && (
              <span className="text-sm text-muted-foreground">Built by</span>
            )}
            <img 
              src={companyLogo} 
              alt="Company Logo" 
              className="max-h-8 max-w-32 object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
