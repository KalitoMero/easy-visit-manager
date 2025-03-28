
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import NavButton from '@/components/NavButton';
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { usePolicyStore } from '@/hooks/usePolicyStore';
import { useToast } from '@/hooks/use-toast';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTranslation } from '@/locale/translations';

const CheckInStep2 = () => {
  const { id } = useParams<{ id: string }>();
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const acceptPolicy = useVisitorStore(state => state.acceptPolicy);
  const visitors = useVisitorStore(state => state.visitors);
  
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  
  // Get policy text and image from the store
  const policyText = usePolicyStore(state => state.getPolicyText(language));
  const policyImageUrl = usePolicyStore(state => state.policyImageUrl);
  
  // Find the current visitor
  const visitor = visitors.find(v => v.id === id);
  
  if (!visitor) {
    return (
      <div className="app-container">
        <HomeButton />
        <div className="page-container">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-xl">Besucher nicht gefunden. Bitte starten Sie erneut.</p>
              <NavButton to="/" className="mt-4">
                {t('backToHome')}
              </NavButton>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    if (!accepted) {
      toast({
        title: t('policyRequired'),
        description: t('policyRequired'),
        variant: "destructive",
      });
      return;
    }
    
    acceptPolicy(visitor.id);
    navigate(`/checkin/step3/${visitor.id}`);
  };

  return (
    <div className="app-container">
      <HomeButton />
      
      <div className="page-container">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">{t('visitorPolicy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] rounded-md border p-4 bg-white/80 backdrop-blur-sm">
              <div className="p-4 text-lg">
                {/* Policy image if available */}
                {policyImageUrl && (
                  <div className="mb-6 flex justify-center">
                    <img 
                      src={policyImageUrl} 
                      alt={t('visitorPolicy')} 
                      className="max-w-full rounded-md max-h-64"
                    />
                  </div>
                )}
                
                {/* Policy text with HTML support */}
                <div dangerouslySetInnerHTML={{ __html: policyText }} />
              </div>
            </ScrollArea>
            
            <div className="flex items-center space-x-2 mt-6">
              <Checkbox 
                id="accept" 
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
              />
              <Label htmlFor="accept" className="text-lg font-medium">
                {t('acceptPolicy')}
              </Label>
            </div>
            
            <div className="pt-6 flex justify-end">
              <Button 
                onClick={handleContinue}
                className="px-10 py-6 text-xl scale-150 transform-gpu transition-all duration-300 hover:scale-[1.55]"
              >
                {t('next')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckInStep2;
