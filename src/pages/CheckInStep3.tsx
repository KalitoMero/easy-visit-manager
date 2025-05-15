
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
import { ArrowLeft, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    // Check if we need to print (from URL parameter)
    const urlParams = new URLSearchParams(location.search);
    const shouldPrint = urlParams.get('print') === 'true';
    
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
    
    // Handle navigation to print page - only if not already initiated
    if (enableAutomaticPrinting && shouldPrint && !printInitiated) {
      console.log("Redirecting to print preview page with automatic printing");
      setPrintInitiated(true);
      
      // Navigate to print page instead of creating an iframe
      // This will rely on the BadgePrintPreview component to handle the actual printing
      navigate(`/print-badge/${visitor.id}`);
    }
  }, [visitor, navigate, updateVisitor, enableAutomaticPrinting, id, location, printInitiated]);

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
