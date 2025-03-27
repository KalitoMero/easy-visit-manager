
import React, { useEffect } from 'react';
import NavButton from '@/components/NavButton';
import { Card, CardContent } from '@/components/ui/card';
import { initializeAutoCheckout } from '@/hooks/useVisitorStore';

const Index = () => {
  useEffect(() => {
    // Set up automatic checkout at 8 PM
    const cleanupAutoCheckout = initializeAutoCheckout();
    return () => cleanupAutoCheckout();
  }, []);

  return (
    <div className="app-container">
      <div className="page-container min-h-[600px]">
        <div className="flex-1 flex flex-col items-center justify-center text-center mb-12 mt-8">
          <h1 className="text-4xl font-bold mb-6 tracking-tight">
            Willkommen bei der Firma Leuka
          </h1>
          <Card className="w-full max-w-2xl bg-white/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <p className="text-xl leading-relaxed">
                Bitte nutzen Sie diese Besucheranwendung, um sich selbstständig an- oder abzumelden. 
                Bei Fragen wenden Sie sich bitte an die Rezeption.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="w-full flex justify-between items-center gap-4 mb-6">
          <NavButton to="/admin" position="left" variant="outline">
            Admin
          </NavButton>
          
          <NavButton to="/checkout" position="center" variant="secondary">
            Besuch abmelden
          </NavButton>
          
          <NavButton to="/checkin/step1" position="right">
            Selbstständig anmelden
          </NavButton>
        </div>
      </div>
    </div>
  );
};

export default Index;
