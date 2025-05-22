
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NavButton from '@/components/NavButton';
import HomeButton from '@/components/HomeButton';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import useTranslation from '@/locale/translations';
import { useLocation } from 'react-router-dom';

const CheckOutSuccess = () => {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const location = useLocation();
  
  // Extract visitor names from location state if any
  const visitorNames = location.state?.visitorNames || [];
  const isGroup = visitorNames.length > 1;

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
              
              {isGroup && visitorNames.length > 0 && (
                <div className="visitor-list bg-muted/30 rounded-md p-4 w-full max-w-md mx-auto my-4">
                  <p className="mb-2 font-medium">
                    {language === 'de' ? 'Ausgewiesene Besucher:' : 'Checked out visitors:'}
                  </p>
                  <ul className="list-none space-y-2">
                    {visitorNames.map((name, index) => (
                      <li key={index}>{name}</li>
                    ))}
                  </ul>
                </div>
              )}
              
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
