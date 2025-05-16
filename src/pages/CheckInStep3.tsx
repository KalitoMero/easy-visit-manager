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
import { ArrowLeft, Timer, Printer, AlertTriangle, Bug } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateVisitorBadgePdf, printPdf } from '@/lib/pdfBadgeGenerator';
import { logDebug } from '@/lib/debugUtils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
  const [printError, setPrintError] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [pdfGenerateAttempts, setPdfGenerateAttempts] = useState(0);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  
  // Find the current visitor
  const visitor = visitors.find(v => v.id === id);

  // Set up log capture for debugging
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      if (args[0] && typeof args[0] === 'string' && args[0].includes('[')) {
        // Capture only our formatted debug logs
        setDiagnosticLogs(prev => {
          const newLogs = [...prev, args.map(a => 
            typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
          ).join(' ')];
          // Keep last 50 logs
          return newLogs.slice(Math.max(0, newLogs.length - 50));
        });
      }
    };
    
    return () => {
      console.log = originalLog;
    };
  }, []);
  
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
      signature: visitor.signature ? "exists" : "none"
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
    
    // Handle automatic printing (with PDF generation)
    if (enableAutomaticPrinting && !printInitiated && visitor.policyAccepted) {
      logDebug('Page', "Initiating automatic PDF printing for visitor:", visitor.visitorNumber);
      setPrintInitiated(true);
      
      // Show a confirmation toast
      toast({
        title: language === 'de' ? "Besucherausweis wird erstellt" : "Creating visitor badge",
        description: language === 'de' 
          ? `Besucherausweis für ${visitor.name} (${visitor.visitorNumber}) wird generiert` 
          : `Creating visitor badge for ${visitor.name} (${visitor.visitorNumber})`,
      });
      
      // Generate and print PDF badge with error handling
      (async () => {
        try {
          setPdfGenerateAttempts(prev => prev + 1);
          logDebug('Page', "Starting PDF generation in CheckInStep3 (attempt " + (pdfGenerateAttempts + 1) + ")");
          
          const { pdfBlob, pdfUrl } = await generateVisitorBadgePdf(visitor);
          logDebug('Page', "PDF generated successfully, saving URL to visitor");
          
          // Save PDF URL to visitor record
          updateVisitor(visitor.id, { badgePdfUrl: pdfUrl });
          
          // Print the PDF
          toast({
            title: language === 'de' ? "Besucherausweis wird gedruckt" : "Printing visitor badge",
            description: language === 'de' 
              ? `Besucherausweis für ${visitor.name} (${visitor.visitorNumber}) wird gedruckt` 
              : `Printing visitor badge for ${visitor.name} (${visitor.visitorNumber})`,
          });
          
          setTimeout(() => {
            try {
              printPdf(pdfUrl);
            } catch (printError) {
              logDebug('Page', "Error during print:", printError);
              setPrintError("Beim Drucken ist ein Fehler aufgetreten.");
            }
          }, 300);
        } catch (error) {
          logDebug('Page', "Error generating PDF badge:", error);
          setPrintError("Besucherausweis konnte nicht erstellt werden.");
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
  }, [visitor, navigate, updateVisitor, enableAutomaticPrinting, id, location, printInitiated, toast, language, pdfGenerateAttempts]);

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
    
    setPrintError(null);
    setPdfGenerateAttempts(prev => prev + 1);
    
    toast({
      title: language === 'de' ? "Druckvorgang gestartet" : "Print process started",
      description: language === 'de' 
        ? "Besucherausweis wird vorbereitet..." 
        : "Visitor badge is being prepared...",
    });
    
    try {
      logDebug('Page', "Starting manual PDF generation (attempt " + (pdfGenerateAttempts + 1) + ")");
      // Generate PDF badge
      const { pdfBlob, pdfUrl } = await generateVisitorBadgePdf(visitor);
      
      // Save PDF URL to visitor record
      updateVisitor(visitor.id, { badgePdfUrl: pdfUrl });
      
      // Print the PDF
      printPdf(pdfUrl);
      
      toast({
        title: language === 'de' ? "Drucken" : "Printing",
        description: language === 'de'
          ? "Besucherausweis wird gedruckt..."
          : "Visitor badge is being printed...",
      });
    } catch (error) {
      logDebug('Page', "Error printing badge:", error);
      setPrintError("Beim Drucken ist ein Fehler aufgetreten.");
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
            
            {printError && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{language === 'de' ? 'Druckfehler' : 'Print Error'}</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>{printError}</p>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-1" 
                    onClick={() => setShowDebugInfo(!showDebugInfo)}
                  >
                    <Bug className="h-4 w-4 mr-1" />
                    {language === 'de' ? 'Debug-Information ' : 'Debug Information '}
                    {showDebugInfo ? (language === 'de' ? 'ausblenden' : 'hide') : (language === 'de' ? 'anzeigen' : 'show')}
                  </Button>
                  
                  {showDebugInfo && (
                    <Accordion type="single" collapsible className="mt-2">
                      <AccordionItem value="attempt-info">
                        <AccordionTrigger className="text-xs py-1">
                          {language === 'de' ? 'Versuchsinformationen' : 'Attempt Information'}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="text-xs bg-slate-100 p-2 rounded">
                            <p>{language === 'de' ? 'Versuche:' : 'Attempts:'} {pdfGenerateAttempts}</p>
                            <p>{language === 'de' ? 'Automatisches Drucken:' : 'Automatic printing:'} {enableAutomaticPrinting ? 'Aktiviert' : 'Deaktiviert'}</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="visitor-info">
                        <AccordionTrigger className="text-xs py-1">
                          {language === 'de' ? 'Besucherinformationen' : 'Visitor Information'}
                        </AccordionTrigger>
                        <AccordionContent>
                          <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify({
                              id: visitor.id,
                              name: visitor.name,
                              company: visitor.company,
                              contact: visitor.contact,
                              visitorNumber: visitor.visitorNumber,
                              checkInTime: visitor.checkInTime,
                              checkOutTime: visitor.checkOutTime,
                              policyAccepted: visitor.policyAccepted,
                              hasSignature: !!visitor.signature,
                              hasBadgePdf: !!visitor.badgePdfUrl,
                            }, null, 2)}
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="diagnostics">
                        <AccordionTrigger className="text-xs py-1">
                          {language === 'de' ? 'Diagnoseprotokolle' : 'Diagnostic Logs'}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-40 font-mono whitespace-pre-wrap">
                            {diagnosticLogs.length > 0 ? (
                              diagnosticLogs.map((log, i) => (
                                <div key={i} className="py-0.5 border-b border-slate-200 last:border-0">
                                  {log}
                                </div>
                              ))
                            ) : (
                              <p>{language === 'de' ? 'Keine Protokolle verfügbar' : 'No logs available'}</p>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {printInitiated && !printError && (
              <div className="text-sm text-muted-foreground">
                {language === 'de' ? 'Besucherausweis wird gedruckt...' : 'Printing visitor badge...'}
              </div>
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
