
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
import { ArrowLeft, Timer, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateVisitorBadgePdf, printPdf } from '@/lib/pdfBadgeGenerator';

const COUNTDOWN_SECONDS = 10; // 10 Sekunden Countdown

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
  const [printInitiated, setPrintInitiated] = useState(false);
  
  // Find the current visitor
  const visitor = visitors.find(v => v.id === id);
  
  useEffect(() => {
    // Ensure we have a visitor before proceeding
    if (!visitor) {
      console.error("Visitor not found with ID:", id);
      navigate('/');
      return;
    }
    
    // Log visitor to confirm its status
    console.log("Visitor on success page:", {
      id: visitor.id,
      name: visitor.name,
      number: visitor.visitorNumber,
      checkInTime: visitor.checkInTime,
      checkOutTime: visitor.checkOutTime,
      policyAccepted: visitor.policyAccepted,
      signature: visitor.signature ? "exists" : "none"
    });
    
    if (!visitor.policyAccepted) {
      console.error("Policy not accepted for visitor:", visitor.visitorNumber);
      navigate(`/checkin/step2/${id}`);
      return;
    }
    
    // Make sure the visitor is not checked out
    if (visitor.checkOutTime) {
      console.log("Fixing visitor checkout status - visitor was incorrectly checked out");
      // Fix: Remove checkout time if it was mistakenly set
      updateVisitor(visitor.id, { checkOutTime: null });
    }
    
    // Handle automatic printing (with PDF generation)
    if (enableAutomaticPrinting && !printInitiated && visitor.policyAccepted) {
      console.log("Initiating automatic PDF printing for visitor:", visitor.visitorNumber);
      setPrintInitiated(true);
      
      // Show a confirmation toast
      toast({
        title: language === 'de' ? "Besucherausweis wird gedruckt" : "Printing visitor badge",
        description: language === 'de' 
          ? `Besucherausweis für ${visitor.name} (${visitor.visitorNumber}) wird gedruckt` 
          : `Printing visitor badge for ${visitor.name} (${visitor.visitorNumber})`,
      });
      
      // Generate and print PDF badge with error handling
      (async () => {
        try {
          const { pdfBlob, pdfUrl } = await generateVisitorBadgePdf(visitor);
          
          // Save PDF URL to visitor record
          updateVisitor(visitor.id, { badgePdfUrl: pdfUrl });
          
          // Print the PDF
          setTimeout(() => {
            printPdf(pdfUrl);
          }, 300);
        } catch (error) {
          console.error("Error generating PDF badge:", error);
          toast({
            title: language === 'de' ? "Fehler beim Drucken" : "Printing Error",
            description: language === 'de' 
              ? "Besucherausweis konnte nicht erstellt werden." 
              : "Could not generate visitor badge.",
            variant: "destructive"
          });
        }
      })();
    }
  }, [visitor, navigate, updateVisitor, enableAutomaticPrinting, id, location, printInitiated, toast, language]);

  // Countdown-Timer Effekt
  useEffect(() => {
    // Starte den Countdown nur, wenn wir einen Besucher haben
    if (visitor) {
      const timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timer);
            navigate('/'); // Zurück zur Startseite nach Ablauf des Countdowns
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
      
      // Bereinigungsfunktion
      return () => clearInterval(timer);
    }
  }, [visitor, navigate]);

  // Manually print badge function
  const handlePrintBadge = async () => {
    if (!visitor) return;
    
    toast({
      title: language === 'de' ? "Druckvorgang gestartet" : "Print process started",
      description: language === 'de' 
        ? "Besucherausweis wird vorbereitet..." 
        : "Visitor badge is being prepared...",
    });
    
    try {
      // Generate PDF badge
      const { pdfBlob, pdfUrl } = await generateVisitorBadgePdf(visitor);
      
      // Save PDF URL to visitor record
      updateVisitor(visitor.id, { badgePdfUrl: pdfUrl });
      
      // Print the PDF
      printPdf(pdfUrl);
    } catch (error) {
      console.error("Error printing badge:", error);
      toast({
        title: language === 'de' ? "Fehler" : "Error",
        description: language === 'de'
          ? "Beim Drucken ist ein Fehler aufgetreten."
          : "An error occurred while printing.",
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
            
            {printInitiated && (
              <div className="text-sm text-muted-foreground">
                {language === 'de' ? 'Besucherausweis wird gedruckt...' : 'Printing visitor badge...'}
              </div>
            )}
            
            {!printInitiated && (
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
