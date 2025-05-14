
import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import NavButton from '@/components/NavButton';
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { usePolicyStore } from '@/hooks/usePolicyStore';
import { useToast } from '@/hooks/use-toast';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTranslation } from '@/locale/translations';
import { ArrowLeft, ArrowDown } from 'lucide-react';

const CheckInStep2 = () => {
  const { id } = useParams<{ id: string }>();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use Object.assign to separate the state slices
  const { acceptPolicy } = useVisitorStore(state => ({ 
    acceptPolicy: state.acceptPolicy 
  }));
  // Use a separate selector for the visitors array to prevent unnecessary re-renders
  const visitors = useVisitorStore(state => state.visitors);
  
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  
  const policyText = usePolicyStore(state => state.getPolicyText(language));
  const policyImageUrl = usePolicyStore(state => state.policyImageUrl);
  
  const visitor = visitors.find(v => v.id === id);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 5;
    
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      toast({
        title: t('scrollComplete'),
        description: t('policyCheckboxEnabled'),
        variant: "default",
      });
    }
  };
  
  if (!visitor) {
    return (
      <div className="app-container">
        <HomeButton />
        <div className="page-container">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-xl">{t('visitorNotFound')}</p>
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
    // Accept policy and navigate directly to success page
    if (id) {
      acceptPolicy(id);
      navigate(`/checkin/step3/${id}`);
    }
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
            {/* Fix: Don't assign ref directly to ScrollArea to avoid infinite loops */}
            <div ref={scrollAreaRef}>
              <ScrollArea 
                className="h-[350px] rounded-md border p-4 bg-white/80 backdrop-blur-sm"
                onScrollCapture={handleScroll}
              >
                <div className="p-4 text-lg">
                  {policyImageUrl && (
                    <div className="mb-6 flex justify-center">
                      <img 
                        src={policyImageUrl} 
                        alt={t('visitorPolicy')} 
                        className="max-w-full rounded-md max-h-64"
                      />
                    </div>
                  )}
                  
                  <div className="whitespace-pre-wrap">{policyText}</div>
                </div>
              </ScrollArea>
            </div>
            
            {!hasScrolledToBottom && (
              <div className="mt-4 text-center text-muted-foreground animate-pulse flex items-center justify-center gap-2">
                <ArrowDown size={18} />
                {t('scrollToBottom')}
                <ArrowDown size={18} />
              </div>
            )}
            
            <div className="pt-6 flex justify-between items-center">
              <NavButton 
                to="/checkin/step1" 
                position="left" 
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                {t('back')}
              </NavButton>
              
              <Button 
                onClick={handleContinue}
                className="px-8 py-6 text-lg transition-all duration-300 hover:scale-105 ml-auto"
                disabled={!hasScrolledToBottom}
              >
                {t('acceptAndContinue')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckInStep2;
