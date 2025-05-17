
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { navigateToPrintPreview } from '@/lib/htmlBadgePrinter';
import { Printer, Home, Timer } from 'lucide-react';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTranslation } from '@/locale/translations';

const CheckInStep3 = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const shouldPrintAutomatically = searchParams.get('print') === 'true';
  
  const [secondsLeft, setSecondsLeft] = useState<number>(10);
  const [redirecting, setRedirecting] = useState<boolean>(false);
  const { toast } = useToast();
  
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  
  // Get visitor from store using the id
  const visitor = useVisitorStore(state => {
    return id ? state.getVisitor(id) : undefined;
  });
  
  // Log visitor status for debugging
  useEffect(() => {
    console.log("[Page] Visitor on success page:", {
      id: visitor?.id,
      name: visitor?.name,
      number: visitor?.visitorNumber,
      checkInTime: visitor?.checkInTime,
      checkOutTime: visitor?.checkOutTime,
      policyAccepted: visitor?.policyAccepted
    });
  }, [visitor]);
  
  // Countdown timer effect for redirecting back to home
  useEffect(() => {
    if (redirecting || !visitor) return;
    
    let timer: number;
    
    if (secondsLeft > 0) {
      timer = window.setTimeout(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else {
      setRedirecting(true);
      navigate('/');
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [secondsLeft, navigate, redirecting, visitor]);
  
  // Automatic print effect
  useEffect(() => {
    if (visitor && shouldPrintAutomatically) {
      console.log("[Page] Initiating automatic HTML badge printing for visitor:", visitor.visitorNumber);
      handlePrintBadge();
    }
  }, [visitor, shouldPrintAutomatically]);
  
  const handlePrintBadge = () => {
    if (!visitor) return;
    
    try {
      // Navigate to print preview
      navigateToPrintPreview(visitor, navigate);
    } catch (error) {
      console.error("Error during print:", error);
      toast({
        title: language === 'de' ? "Druckfehler" : "Print Error",
        description: language === 'de' 
          ? "Beim Drucken ist ein Fehler aufgetreten." 
          : "An error occurred while printing.",
        variant: "destructive",
      });
    }
  };
  
  const handleHomeClick = () => {
    navigate('/');
  };
  
  if (!visitor) {
    return (
      <div className="app-container">
        <HomeButton />
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="text-center pt-8">
            <p className="text-xl">{t('visitorNotFound')}</p>
            <Button onClick={handleHomeClick} className="mt-6">
              {t('backToHome')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="app-container">
      <HomeButton />
      <div className="page-container">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">{t('registrationSuccessful')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center px-4 pt-6 gap-6">
            <div className="check-icon-wrapper mb-2">
              <div className="check-icon">✓</div>
            </div>
            
            <p className="text-xl">
              {language === 'de' 
                ? `Willkommen, ${visitor.name}!`
                : `Welcome, ${visitor.name}!`}
            </p>
            
            <p>
              {language === 'de'
                ? `Ihre Besuchernummer ist: ${visitor.visitorNumber}`
                : `Your visitor number is: ${visitor.visitorNumber}`}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button
                onClick={handlePrintBadge}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                {t('printBadge')}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleHomeClick}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                {t('backToHome')}
              </Button>
            </div>
            
            <div className="flex items-center mt-8 text-muted-foreground">
              <Timer className="h-4 w-4 mr-2" />
              <span>
                {language === 'de' 
                  ? `Zurück zur Startseite (${secondsLeft})` 
                  : `Back to home in ${secondsLeft}`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <style>
        {`
        .check-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: #e6ffe6;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .check-icon {
          color: #00cc00;
          font-size: 40px;
          font-weight: bold;
        }
        `}
      </style>
    </div>
  );
};

export default CheckInStep3;
