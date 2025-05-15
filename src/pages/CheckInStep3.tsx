
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
import { ensureQRCodesLoaded } from '@/lib/qrCodeUtils';
import { useToast } from '@/components/ui/use-toast';

const COUNTDOWN_SECONDS = 10; // 10 Sekunden Countdown

const CheckInStep3 = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Use separate selectors to prevent re-renders
  const visitors = useVisitorStore(state => state.visitors);
  const { enableAutomaticPrinting, printDelay } = usePrinterSettings();
  
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  
  // Countdown Timer
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [printPreparing, setPrintPreparing] = useState(false);
  const [printComplete, setPrintComplete] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  
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
    
    if (!visitor.policyAccepted) {
      console.error("Policy not accepted for visitor:", visitor.visitorNumber);
      navigate(`/checkin/step2/${id}`);
      return;
    }
    
    console.log("Visitor found on success page:", visitor.name, "ID:", visitor.id, "Number:", visitor.visitorNumber);
    console.log("Print settings:", { enableAutomaticPrinting, shouldPrint, printPreparing, printComplete });
    
    // Handle background printing if needed
    if (enableAutomaticPrinting && shouldPrint && !printPreparing && !printComplete) {
      setPrintPreparing(true);
      
      const printBadgeInBackground = async () => {
        try {
          console.log("Starting background print preparation");
          
          // Create a hidden iframe for printing
          const iframe = document.createElement('iframe');
          iframe.style.position = 'absolute';
          iframe.style.left = '-9999px';
          iframe.style.top = '-9999px';
          iframe.style.width = '500px';  // Wider iframe for debugging
          iframe.style.height = '500px'; // Taller iframe for debugging
          iframe.style.border = 'none';
          iframe.style.visibility = 'hidden'; // Hide it but keep it in the DOM
          iframe.src = `/print-badge/${visitor.id}`;
          
          // Add the iframe to the document
          document.body.appendChild(iframe);
          console.log("Print iframe created and appended to document");
          
          // Wait for the iframe to load
          iframe.onload = () => {
            console.log("Print iframe loaded, ensuring QR codes are ready");
            
            // Wait for QR codes and content to be ready with increased timeout
            ensureQRCodesLoaded(() => {
              console.log("QR codes confirmed loaded, proceeding with print");
              
              setTimeout(() => {
                try {
                  // Try to access the iframe content to trigger print
                  if (iframe.contentWindow) {
                    console.log("Triggering print dialog");
                    iframe.contentWindow.print();
                    
                    // Mark as complete after print dialog closes or prints
                    setTimeout(() => {
                      console.log("Print presumed complete");
                      setPrintComplete(true);
                      // Remove the iframe after printing
                      document.body.removeChild(iframe);
                    }, 1000);
                  } else {
                    throw new Error("Cannot access iframe content window");
                  }
                } catch (error) {
                  console.error("Error triggering print:", error);
                  setPrintError("Failed to trigger print dialog");
                  setPrintComplete(true);
                  // Remove the iframe if there's an error
                  document.body.removeChild(iframe);
                }
              }, Math.max(printDelay, 2000)); // Ensure at least 2 seconds for rendering
            }, 5000); // Increase timeout to 5 seconds for QR codes
          };
          
          // Handle iframe loading errors
          iframe.onerror = (error) => {
            console.error("Iframe loading error:", error);
            setPrintError("Failed to load printing content");
            setPrintComplete(true);
            document.body.removeChild(iframe);
          };
        } catch (error) {
          console.error("Error preparing print:", error);
          setPrintError("Failed to prepare for printing");
          setPrintComplete(true);
          toast({
            title: language === 'de' ? 'Druckfehler' : 'Print Error',
            description: language === 'de' ? 'Besucherausweis konnte nicht gedruckt werden' : 'Visitor badge could not be printed',
            variant: "destructive"
          });
        }
      };
      
      printBadgeInBackground();
    }
  }, [visitor, navigate, enableAutomaticPrinting, id, printPreparing, printComplete, printDelay, language, toast, location]);

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
            
            {printError && (
              <div className="text-red-500 text-sm py-2">
                {language === 'de' ? 'Hinweis: Der automatische Druck konnte nicht ausgeführt werden.' : 'Note: Automatic printing could not be completed.'}
              </div>
            )}
            
            {printPreparing && !printComplete && (
              <div className="text-sm text-muted-foreground animate-pulse">
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
