
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NavButton from '@/components/NavButton';
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTranslation } from '@/locale/translations';
import { ArrowLeft, Printer } from 'lucide-react';

const CheckInStep3 = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const visitors = useVisitorStore(state => state.visitors);
  
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  
  // Find the current visitor
  const visitor = visitors.find(v => v.id === id);
  
  useEffect(() => {
    if (!visitor || !visitor.policyAccepted) {
      navigate('/');
    } else {
      // Auto-print badge when the component mounts
      // We set a small timeout to ensure the component is fully rendered
      const timer = setTimeout(() => {
        navigate(`/print-badge/${visitor.id}`);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [visitor, navigate]);
  
  if (!visitor) {
    return null;
  }

  return (
    <div className="app-container">
      <HomeButton />
      
      <div className="page-container">
        <Card className="border-0 shadow-none bg-transparent text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{t('registrationSuccessful')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="py-8">
              <p className="text-xl mb-8">
                {t('yourVisitorNumber')}
              </p>
              <div className="text-7xl font-bold text-primary py-4">
                {visitor.visitorNumber}
              </div>
              <p className="text-xl mt-8">
                {t('pleaseNote')}
              </p>
            </div>
            
            <Card className="bg-primary/10 border-primary/30 p-4">
              <p className="text-lg">
                {t('contactInfo')} <strong>{visitor.contact}</strong> {language === 'de' ? 'wurde über Ihre Ankunft informiert' : 'has been informed of your arrival'}.
              </p>
            </Card>
            
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => navigate(`/print-badge/${visitor.id}`)}
                variant="outline"
                className="flex items-center gap-2 px-6 py-5 text-lg"
              >
                <Printer size={20} />
                {t('viewPrintableBadge')}
              </Button>
            </div>
            
            <div className="pt-6 flex justify-between items-center">
              <NavButton 
                to={`/checkin/step2/${visitor.id}`} 
                position="left" 
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                {t('back')}
              </NavButton>
              
              <NavButton to="/" position="right">
                {t('backToHome')}
              </NavButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckInStep3;
