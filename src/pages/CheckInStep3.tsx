
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { Home, Timer, Printer } from 'lucide-react';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import useTranslation from '@/locale/translations';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import { navigateToPrintPreview, resetPrintStatus } from '@/lib/htmlBadgePrinter';
import { logDebug } from '@/lib/debugUtils';

// Storage key for tracking recent print operations
const PRINT_HISTORY_KEY = 'visitor-print-history';

const CheckInStep3 = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [secondsLeft, setSecondsLeft] = useState<number>(10);
  const [redirecting, setRedirecting] = useState<boolean>(false);
  const { toast } = useToast();
  
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const { enableAutomaticPrinting, skipPrintPreview } = usePrinterSettings();
  
  // Get visitor from store using the id
  const visitor = useVisitorStore(state => {
    return id ? state.getVisitor(id) : undefined;
  });
  
  // Flag to track if print was already initiated - use ref to persist between renders
  const printInitiated = useRef(false);
  const initialLoadComplete = useRef(false);
  
  // Check if this visitor was recently printed
  const wasRecentlyPrinted = () => {
    if (!id) return false;
    
    try {
      const printHistory = JSON.parse(localStorage.getItem(PRINT_HISTORY_KEY) || '{}');
      if (!printHistory[id]) return false;
      
      const elapsedTime = Date.now() - printHistory[id];
      return elapsedTime < 10000; // 10 seconds
    } catch (e) {
      return false;
    }
  };
  
  // Reset print status on component mount
  useEffect(() => {
    // Reset any stuck print status - but don't trigger new prints from here
    resetPrintStatus();
    logDebug('Print', 'CheckInStep3 - Resetting print status');
    
    return () => {
      // Also reset on unmount
      resetPrintStatus();
    };
  }, []);
  
  // Handle automatic printing only once and only if not already printed
  useEffect(() => {
    // Skip if already done or visitor is missing
    if (initialLoadComplete.current || printInitiated.current || !visitor || !enableAutomaticPrinting) {
      return;
    }
    
    // Check if coming from print page or visitor was recently printed
    if (wasRecentlyPrinted()) {
      logDebug('Print', 'CheckInStep3 - Visitor was recently printed, skipping auto-print');
      initialLoadComplete.current = true;
      return;
    }
    
    initialLoadComplete.current = true;
    
    // IMPORTANT: Only initiate print if we're not coming from print flow
    const comingFromPrintFlow = searchParams.get('fromPrint') === 'true';
    if (comingFromPrintFlow) {
      logDebug('Print', 'CheckInStep3 - Coming from print flow, skipping automatic print');
      return;
    }
    
    // Use timeout to ensure the store is fully updated
    const timer = setTimeout(() => {
      logDebug('Print', 'CheckInStep3 - Initiating automatic print for visitor:', visitor.visitorNumber);
      printInitiated.current = true;
      navigateToPrintPreview(visitor, navigate, skipPrintPreview);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [visitor, enableAutomaticPrinting, navigate, skipPrintPreview, searchParams]);
  
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
  
  const handleHomeClick = () => {
    navigate('/');
  };
  
  const handlePrintBadge = () => {
    if (visitor && !printInitiated.current) {
      printInitiated.current = true;
      navigateToPrintPreview(visitor, navigate);
    }
  };
  
  // Function to get all visitor names
  const getAllVisitorNames = () => {
    if (!visitor) return [];
    
    const allVisitors = [
      { name: visitor.name, firstName: visitor.firstName }
    ];
    
    if (visitor.additionalVisitors && visitor.additionalVisitors.length > 0) {
      visitor.additionalVisitors.forEach(additionalVisitor => {
        allVisitors.push({
          name: additionalVisitor.name,
          firstName: additionalVisitor.firstName
        });
      });
    }
    
    return allVisitors;
  };
  
  // Generate welcome message based on language and visitor count
  const getWelcomeMessage = () => {
    const allVisitors = getAllVisitorNames();
    
    if (allVisitors.length === 1) {
      // Single visitor welcome message
      return language === 'de' 
        ? `Willkommen, Herr / Frau / Div ${visitor?.name}!`
        : `Welcome, Mr. / Mrs. / Div ${visitor?.name}!`;
    } else {
      // Group welcome message
      return language === 'de'
        ? `Willkommen an alle Besucher:`
        : `Welcome to all visitors:`;
    }
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
  
  // Get all visitor names to display
  const allVisitors = getAllVisitorNames();
  
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
              {getWelcomeMessage()}
            </p>
            
            {/* Display visitor list if multiple visitors */}
            {allVisitors.length > 1 && (
              <div className="visitor-list bg-muted/30 rounded-md p-4 w-full max-w-md">
                <ul className="list-none space-y-2">
                  {allVisitors.map((visitor, index) => (
                    <li key={index} className="font-medium">
                      {visitor.firstName ? `${visitor.firstName} ${visitor.name}` : visitor.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <p>
              {language === 'de'
                ? `${allVisitors.length > 1 ? 'Ihre Besuchernummern wurden' : 'Ihre Besuchernummer ist'}: ${visitor.visitorNumber}${visitor.additionalVisitors?.map(v => `, ${v.visitorNumber}`).join('') || ''}`
                : `${allVisitors.length > 1 ? 'Your visitor numbers are' : 'Your visitor number is'}: ${visitor.visitorNumber}${visitor.additionalVisitors?.map(v => `, ${v.visitorNumber}`).join('') || ''}`}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button
                variant="outline"
                onClick={handleHomeClick}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                {t('backToHome')}
              </Button>
              
              {!printInitiated.current && !enableAutomaticPrinting && !wasRecentlyPrinted() && (
                <Button
                  onClick={handlePrintBadge}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  {language === 'de' ? 'Ausweise drucken' : 'Print Badges'}
                </Button>
              )}
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

        /* Hide success page content when printing */
        @media print {
          body * {
            visibility: hidden !important;
          }
        }
        `}
      </style>
    </div>
  );
};

export default CheckInStep3;
