
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import NavButton from '@/components/NavButton';
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { usePolicyStore } from '@/hooks/usePolicyStore';
import { useToast } from '@/components/ui/use-toast';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import useTranslation from '@/locale/translations';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import { ArrowLeft, ArrowDown } from 'lucide-react';
import SignaturePad from '@/components/SignaturePad';
import { navigateToPrintPreview, resetPrintStatus } from '@/lib/htmlBadgePrinter';

const CheckInStep2 = () => {
  const { id } = useParams<{ id: string }>();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get printer settings for automatic printing
  const enableAutomaticPrinting = usePrinterSettings(state => state.enableAutomaticPrinting);
  const skipPrintPreview = usePrinterSettings(state => state.skipPrintPreview);
  
  // Use separate selectors to prevent re-renders
  const acceptPolicy = useVisitorStore(state => state.acceptPolicy);
  const visitors = useVisitorStore(state => state.visitors);
  
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  
  const policyText = usePolicyStore(state => state.getPolicyText(language));
  const policyImageUrl = usePrinterSettings(state => state.policyImageUrl);
  
  // Memoize the visitor lookup to prevent unnecessary re-renders
  const visitor = React.useMemo(() => {
    return visitors.find(v => v.id === id);
  }, [visitors, id]);
  
  // Debug log to see visitor status
  useEffect(() => {
    if (visitor) {
      console.log("Current visitor status:", {
        id: visitor.id,
        name: visitor.name,
        number: visitor.visitorNumber,
        checkInTime: visitor.checkInTime,
        checkOutTime: visitor.checkOutTime,
        policyAccepted: visitor.policyAccepted
      });
    }
  }, [visitor]);
  
  // Druckstatus zurücksetzen, wenn Komponente gemountet wird
  useEffect(() => {
    resetPrintStatus();
  }, []);
  
  const handleScrollToBottom = React.useCallback(() => {
    if (!hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      toast({
        title: t('scrollComplete'),
        description: language === 'de' ? 'Bitte unterschreiben Sie unten' : 'Please sign below',
        variant: "default",
      });
    }
  }, [hasScrolledToBottom, toast, t, language]);
  
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
    if (isProcessing) return;
    setIsProcessing(true);
    
    // Accept policy with signature - without affecting checkout status
    if (id) {
      try {
        console.log("Accepting policy for visitor:", visitor.visitorNumber);
        acceptPolicy(id, signature);
        
        // Vor der Navigation den Druckstatus zurücksetzen
        resetPrintStatus();
        
        // If automatic printing is enabled, redirect to print preview or print directly
        if (enableAutomaticPrinting) {
          console.log("Automatic printing enabled, initiating print flow");
          // Route parameter hinzufügen, um zu kennzeichnen, dass wir vom Checkin-Flow kommen
          navigateToPrintPreview(visitor, navigate, skipPrintPreview);
        } else {
          console.log("Automatic printing disabled, navigating to success page");
          navigate(`/checkin/step3/${id}`);
        }
      } catch (error) {
        console.error("Error during policy acceptance:", error);
        toast({
          title: language === 'de' ? 'Fehler' : 'Error',
          description: language === 'de' 
            ? 'Bei der Verarbeitung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
            : 'An error occurred during processing. Please try again.',
          variant: "destructive"
        });
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="app-container">
      <HomeButton />
      
      <div className="page-container">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center relative pb-2">
            {/* Moved back button to top left corner */}
            <div className="absolute left-0 top-0">
              <NavButton 
                to="/checkin/step1" 
                position="left" 
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                {t('back')}
              </NavButton>
            </div>
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
              <div className="mt-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-4">
                    {language === 'de' ? 'Bitte unterschreiben Sie hier:' : 'Please sign here:'}
                  </h3>
                  <SignaturePad 
                    onChange={handleSignatureChange} 
                    width={window.innerWidth > 768 ? 400 : window.innerWidth - 80}
                    height={200}
                  />
                </div>
                
                {/* Buttons placed to the right of signature pad */}
                <div className="flex flex-col justify-center gap-4">
                  <Button 
                    onClick={handleContinue}
                    className="px-6 py-6 text-lg transition-all duration-300 hover:scale-105"
                    disabled={!hasScrolledToBottom || !signature || isProcessing}
                  >
                    {isProcessing ? (
                      language === 'de' ? 'Verarbeitung...' : 'Processing...'
                    ) : (
                      t('acceptAndContinue')
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckInStep2;
