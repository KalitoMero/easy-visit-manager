
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NavButton from '@/components/NavButton';
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import { useTranslation } from '@/locale/translations';
import { ArrowLeft, Timer, Printer, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logDebug } from '@/lib/debugUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { navigateToPrintPreview } from '@/lib/htmlBadgePrinter';

const COUNTDOWN_SECONDS = 10; // 10 seconds countdown

const CheckInStep3 = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Use separate selectors to prevent re-renders
  const visitors = useVisitorStore(state => state.visitors);
  const updateVisitor = useVisitorStore(state => state.updateVisitor);
  const { enableAutomaticPrinting } = usePrinterSettings();
  
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  
  // Countdown Timer
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [printError, setPrintError] = useState<string | null>(null);
  const [printInitiated, setPrintInitiated] = useState(false);
  
  // Find the current visitor
  const visitor = visitors.find(v => v.id === id);

  useEffect(() => {
    // Ensure we have a visitor before proceeding
    if (!visitor) {
      logDebug('Page', "Visitor not found with ID:", id);
      navigate('/');
      return;
    }
    
    // Log visitor to confirm its status
    logDebug('Page', "Visitor on success page:", {
      id: visitor.id,
      name: visitor.name,
      number: visitor.visitorNumber,
      checkInTime: visitor.checkInTime,
      checkOutTime: visitor.checkOutTime,
      policyAccepted: visitor.policyAccepted,
    });
    
    if (!visitor.policyAccepted) {
      logDebug('Page', "Policy not accepted for visitor:", visitor.visitorNumber);
      navigate(`/checkin/step2/${id}`);
      return;
    }
    
    // Make sure the visitor is not checked out
    if (visitor.checkOutTime) {
      logDebug('Page', "Fixing visitor checkout status - visitor was incorrectly checked out");
      // Fix: Remove checkout time if it was mistakenly set
      updateVisitor(visitor.id, { checkOutTime: null });
    }
    
    // Handle automatic printing
    if (enableAutomaticPrinting && !printInitiated && visitor.policyAccepted) {
      logDebug('Page', "Initiating automatic HTML badge printing for visitor:", visitor.visitorNumber);
      setPrintInitiated(true);
      
      // Show a confirmation toast
      toast({
        title: language === 'de' ? "Besucherausweis wird vorbereitet" : "Preparing visitor badge",
        description: language === 'de' 
          ? `Besucherausweis für ${visitor.name} (${visitor.visitorNumber}) wird vorbereitet` 
          : `Preparing visitor badge for ${visitor.name} (${visitor.visitorNumber})`,
      });
      
      try {
        // Navigate to the print preview page
        navigateToPrintPreview(visitor, navigate);
      } catch (error) {
        logDebug('Page', "Error navigating to print preview:", error);
        setPrintError("Fehler beim Erstellen des Besucherausweises.");
        toast({
          title: language === 'de' ? "Fehler" : "Error",
          description: language === 'de' 
            ? "Der Besucherausweis konnte nicht erstellt werden." 
            : "Could not create visitor badge.",
          variant: "destructive"
        });
      }
    }
  }, [visitor, navigate, updateVisitor, enableAutomaticPrinting, id, printInitiated, toast, language]);

  // Countdown Timer Effect
  useEffect(() => {
    // Only start countdown if we have a visitor
    if (visitor) {
      const timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timer);
            navigate('/'); // Return to home page when countdown ends
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
      
      // Cleanup function
      return () => clearInterval(timer);
    }
  }, [visitor, navigate]);

  // Manual badge print function
  const handlePrintBadge = () => {
    if (!visitor) return;
    
    setPrintError(null);
    
    toast({
      title: language === 'de' ? "Druckvorgang gestartet" : "Print process started",
      description: language === 'de' 
        ? "Besucherausweis wird vorbereitet..." 
        : "Visitor badge is being prepared...",
    });
    
    try {
      logDebug('Page', "Starting manual badge printing navigation");
      // Navigate to print preview page
      navigateToPrintPreview(visitor, navigate);
    } catch (error) {
      logDebug('Page', "Error navigating to print preview:", error);
      setPrintError("Fehler beim Erstellen des Besucherausweises.");
      toast({
        title: language === 'de' ? "Fehler" : "Error",
        description: language === 'de'
          ? "Der Besucherausweis konnte nicht erstellt werden."
          : "Could not create visitor badge.",
        variant: "destructive"
      });
    }
  };
  
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
                {language === 'de' ? 'Ihre Besuchernummer lautet:' : 'Your visitor number is:'}
              </p>
              <div className="text-7xl font-bold text-primary py-4">
                {visitor.visitorNumber}
              </div>
            </div>
            
            <Card className="bg-primary/10 border-primary/30 p-4">
              <p className="text-lg">
                {language === 'de' ? 'Wir informieren Ihren Ansprechpartner' : 'We will inform your contact person'} <strong>{visitor.contact}</strong> {language === 'de' ? 'über Ihre Ankunft.' : 'about your arrival.'}
              </p>
            </Card>
            
            {printError && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{language === 'de' ? 'Druckfehler' : 'Print Error'}</AlertTitle>
                <AlertDescription>
                  <p>{printError}</p>
                </AlertDescription>
              </Alert>
            )}
            
            {(!printInitiated || printError) && (
              <Button 
                onClick={handlePrintBadge}
                variant="outline" 
                className="mt-2"
              >
                <Printer className="h-4 w-4 mr-2" />
                {language === 'de' ? 'Besucherausweis drucken' : 'Print visitor badge'}
              </Button>
            )}
            
            <div className="pt-6 flex flex-col items-center justify-center">
              <div className="mb-2 flex items-center text-muted-foreground">
                <Timer className="h-4 w-4 mr-1" />
                <span>{language === 'de' ? 'Automatische Rückkehr zur Startseite in' : 'Automatic return to home in'} {countdown} {countdown === 1 ? (language === 'de' ? 'Sekunde' : 'second') : (language === 'de' ? 'Sekunden' : 'seconds')}</span>
              </div>
              <NavButton to="/" position="center">
                {language === 'de' ? `Zurück zur Startseite (${countdown})` : `Back to Home (${countdown})`}
              </NavButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckInStep3;
