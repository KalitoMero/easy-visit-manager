import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { useToast } from '@/hooks/use-toast';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTranslation } from '@/locale/translations';

const CheckOut = () => {
  const [visitorNumber, setVisitorNumber] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const checkOutVisitor = useVisitorStore(state => state.checkOutVisitor);
  const getVisitorByNumber = useVisitorStore(state => state.getVisitorByNumber);
  
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  
  const handleCheckOut = () => {
    if (!visitorNumber) {
      toast({
        title: t('numberRequired'),
        description: t('numberRequired'),
        variant: "destructive",
      });
      return;
    }
    
    const number = parseInt(visitorNumber);
    if (isNaN(number)) {
      toast({
        title: t('invalidNumber'),
        description: t('invalidNumber'),
        variant: "destructive",
      });
      return;
    }
    
    const visitor = getVisitorByNumber(number);
    if (visitor) {
      checkOutVisitor(visitor.id);
      navigate('/checkout/success');
    } else {
      toast({
        title: t('checkOutFailed'),
        description: t('checkOutFailed'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="app-container">
      <HomeButton />
      
      <div className="page-container">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">{t('visitorCheckOut')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <p className="text-xl text-center">
              {t('enterVisitorNumber')}
            </p>
            
            <div className="max-w-md mx-auto">
              <Label htmlFor="visitorNumber" className="text-lg block mb-2">
                {t('visitorNumberLabel')}
              </Label>
              <Input
                id="visitorNumber"
                value={visitorNumber}
                onChange={(e) => setVisitorNumber(e.target.value)}
                className="h-14 text-lg text-center bg-white/80 backdrop-blur-sm"
                placeholder={language === 'de' ? 'z.B. 101' : 'e.g. 101'}
                type="number"
                autoFocus
                autoComplete="off"
              />
            </div>
            
            <div className="pt-4 flex justify-center">
              <Button 
                onClick={handleCheckOut}
                className="px-10 py-6 text-xl transition-all duration-300 hover:scale-105"
              >
                {t('checkOutButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckOut;
