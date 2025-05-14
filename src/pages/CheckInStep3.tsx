import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NavButton from '@/components/NavButton';
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import { useTranslation } from '@/locale/translations';
import { ArrowLeft, Printer, Timer } from 'lucide-react';
import { ensureQRCodesLoaded } from '@/lib/qrCodeUtils';

const COUNTDOWN_SECONDS = 10; // 10 Sekunden Countdown

const CheckInStep3 = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const visitors = useVisitorStore(state => state.visitors);
  const { enableAutomaticPrinting } = usePrinterSettings();
  
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  
  // Countdown Timer
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [printPreparing, setPrintPreparing] = useState(false);
  
  // Find the current visitor
  const visitor = visitors.find(v => v.id === id);
  
  useEffect(() => {
    if (!visitor) {
      navigate('/');
    } else if (!visitor.policyAccepted) {
      navigate(`/checkin/step2/${id}`);
    } else if (enableAutomaticPrinting && !printPreparing) {
      // Markiere als in Vorbereitung
      setPrintPreparing(true);
      
      // Stellen Sie sicher, dass QR-Codes geladen werden, bevor Sie drucken
      const preparePrinting = async () => {
        // Iframe erstellen, aber noch nicht zum DOM hinzufügen
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = `/print-badge/${visitor.id}`;
        
        // Warten, bis der Iframe geladen ist und dann QR-Code-Ladung sicherstellen
        iframe.onload = () => {
          console.log("Print iframe loaded, ensuring QR codes are ready");
          
          // QR-Code-Ladung in iframe prüfen und warten
          setTimeout(() => {
            document.body.appendChild(iframe);
          }, 500);
        };
        
        // Starte den Ladevorgang
        document.body.appendChild(iframe);
        
        return () => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        };
      };
      
      preparePrinting();
    }
  }, [visitor, navigate, enableAutomaticPrinting, id, printPreparing]);

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
                {t('yourVisitorNumber')}
              </p>
              <div className="text-7xl font-bold text-primary py-4">
                {visitor.visitorNumber}
              </div>
              <p className="text-xl mt-8">
                {t('pleaseNote')}
              </p>
            </div>
            
            <Card className="bg-primary/10 border-primary/30 p-4">
              <p className="text-lg">
                {t('contactInfo')} <strong>{visitor.contact}</strong> {language === 'de' ? 'wurde über Ihre Ankunft informiert' : 'has been informed of your arrival'}.
              </p>
            </Card>
            
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => navigate(`/print-badge/${visitor.id}`)}
                variant="outline"
                className="flex items-center gap-2 px-6 py-5 text-lg"
              >
                <Printer size={20} />
                {t('viewPrintableBadge')}
              </Button>
            </div>
            
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
