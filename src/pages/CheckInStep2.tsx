
import React, { useState, useRef, useEffect } from 'react';
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
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import { ArrowLeft, ArrowDown } from 'lucide-react';
import SignaturePad from '@/components/SignaturePad';

const CheckInStep2 = () => {
  const { id } = useParams<{ id: string }>();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get printer settings for automatic printing
  const enableAutomaticPrinting = usePrinterSettings(state => state.enableAutomaticPrinting);
  const printDelay = usePrinterSettings(state => state.printDelay);
  
  // Use separate selectors to prevent re-renders
  const acceptPolicy = useVisitorStore(state => state.acceptPolicy);
  const visitors = useVisitorStore(state => state.visitors);
  
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  
  const policyText = usePolicyStore(state => state.getPolicyText(language));
  const policyImageUrl = usePolicyStore(state => state.policyImageUrl);
  
  // Memoize the visitor lookup to prevent unnecessary re-renders
  const visitor = React.useMemo(() => {
    return visitors.find(v => v.id === id);
  }, [visitors, id]);
  
  const handleScrollToBottom = React.useCallback(() => {
    if (!hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      toast({
        title: t('scrollComplete'),
        description: t('signatureRequired'),
        variant: "default",
      });
    }
  }, [hasScrolledToBottom, toast, t]);
  
  // Handle signature change
  const handleSignatureChange = (signatureDataUrl: string | null) => {
    setSignature(signatureDataUrl);
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
    // Accept policy with signature
    if (id) {
      acceptPolicy(id, signature);
      
      // If automatic printing is enabled, navigate to badge print preview first
      if (enableAutomaticPrinting) {
        // Navigate to the print badge page, which will trigger automatic printing
        navigate(`/print-badge/${id}`);
      } else {
        // Otherwise proceed to the success page as before
        navigate(`/checkin/step3/${id}`);
      }
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
            <div ref={scrollAreaRef} className="relative">
              <ScrollArea 
                className="h-[350px] rounded-md border p-4 bg-white/80 backdrop-blur-sm"
                onScrollToBottom={handleScrollToBottom}
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
            
            {/* Signature area - only show after scrolling to bottom */}
            {hasScrolledToBottom && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">
                  {language === 'de' ? 'Bitte unterschreiben Sie hier:' : 'Please sign here:'}
                </h3>
                <SignaturePad 
                  onChange={handleSignatureChange} 
                  width={window.innerWidth > 768 ? 400 : window.innerWidth - 80}
                  height={200}
                />
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
                disabled={!hasScrolledToBottom || !signature}
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
