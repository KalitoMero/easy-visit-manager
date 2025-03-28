
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NavButton from '@/components/NavButton';
import HomeButton from '@/components/HomeButton';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTranslation } from '@/locale/translations';

const CheckOutSuccess = () => {
  const { language } = useLanguageStore();
  const t = useTranslation(language);

  return (
    <div className="app-container">
      <HomeButton />
      
      <div className="page-container">
        <Card className="border-0 shadow-none bg-transparent text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{t('successfullyCheckedOut')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="py-12">
              <p className="text-2xl mb-4">
                {t('thankYou')}
              </p>
              <p className="text-2xl text-primary">
                {t('safeJourney')}
              </p>
            </div>
            
            <div className="pt-6">
              <NavButton to="/" position="center">
                {t('backToHome')}
              </NavButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckOutSuccess;
