
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import VisitorBadge from '@/components/VisitorBadge';
import { useToast } from "@/hooks/use-toast";
import HomeButton from "@/components/HomeButton";
import { Button } from '@/components/ui/button';
import { Printer, Home } from 'lucide-react';
import { logDebug } from '@/lib/debugUtils';
import { isElectron, createPrintController, resetPrintStatus } from '@/lib/htmlBadgePrinter';

// Erstellen eines Print-Controllers für diese Komponente
const printController = createPrintController();

const BadgePrintPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDirect = searchParams.get('direct') === 'true';
  const fromCheckin = searchParams.get('flow') === 'checkin';
  
  const visitors = useVisitorStore(state => state.visitors);
  const { toast } = useToast();
  
  // Druckereinstellungen
  const { 
    enableAutomaticPrinting, 
    badgeRotation,
    badgeOffsetX,
    badgeOffsetY,
    secondBadgeRotation,
    secondBadgeOffsetX,
    secondBadgeOffsetY,
    badgeLayout,
    bottomMargin
  } = usePrinterSettings();
  
  // Status-Tracking
  const printTimestamp = useRef(new Date()).current;
  const [printingCompleted, setPrintingCompleted] = useState(false);
  const [printHandled, setPrintHandled] = useState(false);
  
  // Besucher finden
  const visitor = visitors.find(v => v.id === id);
  const hasAdditionalVisitors = visitor?.additionalVisitors && visitor.additionalVisitors.length > 0;

  // Druckstile hinzufügen
  useEffect(() => {
    // Neues Stilelement für Druckstile erstellen
    const styleEl = document.createElement('style');
    styleEl.setAttribute('type', 'text/css');
    styleEl.textContent = `
      @media print {
        /* UI-Elemente beim Drucken ausblenden */
        body * {
          visibility: hidden;
        }
        
        /* Nur den Badge-Container und seinen Inhalt anzeigen */
        .visitor-badge-container, .visitor-badge-container * {
          visibility: visible;
        }

        /* Container für A6-Papier positionieren */
        .visitor-badge-container {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 105mm !important; /* A6-Breite */
          height: 148mm !important; /* A6-Höhe */
          padding: 0 !important;
          margin: 0 !important;
          padding-bottom: ${bottomMargin}mm !important; /* Unterer Rand anwenden */
          box-sizing: border-box !important;
          overflow: hidden !important;
          page-break-after: always !important;
        }
        
        /* Sicherstellen, dass beide Badges sichtbar und korrekt positioniert sind */
        .visitor-badge-page {
          position: relative !important;
          width: 105mm !important;
          height: 148mm !important;
          page-break-after: always !important;
        }
        
        /* Das erste Badge oben positionieren */
        .visitor-badge-top {
          position: absolute !important;
          top: 5mm !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: 60mm !important;
          height: 69mm !important;
          overflow: visible !important;
        }
        
        /* Das zweite Badge unten positionieren */
        .visitor-badge-bottom {
          position: absolute !important;
          top: 74mm !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: 60mm !important;
          height: 69mm !important;
          overflow: visible !important;
        }
        
        /* Trennlinie hinzufügen */
        .badge-divider {
          border-top: 1px dashed #999 !important;
          width: 100% !important;
          position: absolute !important;
          top: 74mm !important;
          left: 0 !important;
          visibility: visible !important;
        }
        
        /* Badge-Abmessungen: genau 60mm x 69mm */
        .print-badge {
          width: 60mm !important;
          height: 69mm !important;
          margin: 0 !important;
          padding: 1mm !important;
          box-sizing: border-box !important;
          overflow: visible !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* Badge-Inhalts-Layout */
        .badge-content {
          flex: 1 !important;
          display: flex !important;
          justify-content: space-between !important;
        }

        /* Lovable-Branding ausblenden */
        .lovable-badge, 
        [data-lovable-badge="true"],
        #lovable-badge-root,
        [class*="lovable-badge"],
        [id*="lovable-editor"],
        [data-testid="badge-root"] {
          display: none !important;
          visibility: hidden !important;
        }

        /* A6-Seiteneinstellungen */
        @page {
          size: 105mm 148mm !important;
          margin: 0 !important;
        }
      }
    `;
    
    // Stile zum Kopf hinzufügen
    document.head.appendChild(styleEl);
    
    // Aufräumen
    return () => {
      document.head.removeChild(styleEl);
      // Druckstatus zurücksetzen beim Unmount der Komponente
      resetPrintStatus();
    };
  }, [bottomMargin]);
  
  // Automatisches Drucken behandeln - Nach dem Laden sofort drucken
  useEffect(() => {
    // Überspringen, wenn bereits behandelt oder kein Besucher
    if (printHandled || !visitor) return;
    
    // Wenn automatisches Drucken aktiviert ist oder es eine direkte Druckanforderung ist
    if ((enableAutomaticPrinting || isDirect) && !printingCompleted) {
      setPrintHandled(true);
      
      logDebug('Print', "Automatischen Druckprozess starten");
      
      try {
        // Nur drucken, wenn der printController zustimmt
        if (printController.print()) {
          // Verzögerung hinzufügen, um sicherzustellen, dass die UI fertig gerendert ist
          setTimeout(() => {
            if (isElectron()) {
              // Über Electron-API drucken
              window.electronAPI.printBadge({
                id: visitor.id,
                name: visitor.name,
              }).then(() => {
                setPrintingCompleted(true);
                // Druckstatus zurücksetzen
                resetPrintStatus();
              }).catch((err) => {
                console.error("Electron-Druckfehler:", err);
                setPrintingCompleted(true);
                resetPrintStatus();
              });
            } else {
              // Direktes Drucken ohne Verzögerung
              window.print();
              
              // Verzögert als abgeschlossen markieren, um Zeit für den Druckdialog zu geben
              setTimeout(() => {
                setPrintingCompleted(true);
                // Druckstatus zurücksetzen
                resetPrintStatus();
              }, 1000);
            }
          }, 300);
        }
      } catch (error) {
        console.error("Druckfehler:", error);
        setPrintingCompleted(true);
        resetPrintStatus();
      }
    }
  }, [visitor, enableAutomaticPrinting, isDirect, printingCompleted, printHandled]);
  
  // Nach dem Drucken weiterleiten
  useEffect(() => {
    if (printingCompleted && visitor) {
      logDebug('Print', "Weiterleitung nach dem Drucken");
      
      // Setzen Sie einen Timeout, um sicherzustellen, dass der Druck vollständig ist
      const redirectTimeout = setTimeout(() => {
        printController.reset(); // Controller zurücksetzen
        resetPrintStatus(); // Globalen Druckstatus zurücksetzen
        
        // Wenn dies direkt geöffnet wurde, das Fenster schließen, anstatt zu navigieren
        if (isDirect) {
          window.close();
        } else if (fromCheckin) {
          // Zurück zur Checkout-Erfolgsseite, wenn vom Checkin-Flow
          navigate(`/checkin/step3/${visitor.id}`);
        } else {
          // Zurück zur vorherigen Seite oder Startseite
          navigate(-1);
        }
      }, 1000);
      
      // Timeout aufräumen, wenn die Komponente unmountet wird
      return () => clearTimeout(redirectTimeout);
    }
  }, [printingCompleted, visitor, navigate, isDirect, fromCheckin]);
  
  // Verhindert Druckschleifen nach dem ersten Druckversuch
  useEffect(() => {
    // Handler für das afterprint-Event hinzufügen
    const handleAfterPrint = () => {
      logDebug('Print', 'afterprint event fired - Print dialog closed');
      setPrintingCompleted(true);
      resetPrintStatus(); // Druckstatus zurücksetzen
    };
    
    window.addEventListener('afterprint', handleAfterPrint);
    
    // Handler entfernen, wenn die Komponente unmountet wird
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);
  
  // Manuelles Drucken behandeln
  const handleManualPrint = () => {
    if (printHandled || printingCompleted) {
      logDebug('Print', "Druck bereits ausgelöst, Anforderung wird ignoriert");
      return;
    }
    
    toast({
      title: "Druckvorgang gestartet",
      description: "Das Druckfenster wird geöffnet...",
    });
    
    // Nur drucken, wenn der printController zustimmt
    if (printController.print()) {
      setPrintHandled(true);
      window.print();
      
      // Kurze Verzögerung vor dem Setzen als abgeschlossen
      setTimeout(() => {
        setPrintingCompleted(true);
        resetPrintStatus(); // Druckstatus zurücksetzen
      }, 1000);
    }
  };
  
  // Zurück zur Erfolgsseite
  const handleReturn = () => {
    if (visitor) {
      if (fromCheckin) {
        navigate(`/checkin/step3/${visitor.id}`);
      } else {
        navigate(-1);
      }
    } else {
      navigate('/');
    }
  };
  
  if (!visitor) {
    return (
      <div className="p-8 text-center">
        <HomeButton />
        <div className="mt-8">Besucher nicht gefunden</div>
      </div>
    );
  }
  
  // Array aller zu druckenden Besucher vorbereiten (Hauptbesucher + zusätzliche)
  const allVisitorsToDisplay = [
    { 
      ...visitor,
      isMain: true 
    },
    ...(visitor.additionalVisitors?.map(av => ({
      ...av,
      company: visitor.company,
      contact: visitor.contact,
      checkInTime: visitor.checkInTime,
      isMain: false
    })) || [])
  ];
  
  return (
    <div className="p-4 flex flex-col gap-4 print:p-0">
      {/* UI-Steuerelemente - nur auf dem Bildschirm sichtbar */}
      <div className="print:hidden">
        <HomeButton />
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Besucherausweis Druckvorschau</h2>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleManualPrint}
              variant="outline"
              className="flex items-center gap-2"
              disabled={printHandled || printingCompleted}
            >
              <Printer className="h-4 w-4" />
              Drucken
            </Button>
            
            <Button 
              onClick={handleReturn}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Zurück
            </Button>
          </div>
        </div>
      </div>
      
      {/* Badge-Container für den Druck - auf dem Bildschirm ausgeblendet, beim Drucken sichtbar */}
      <div className="visitor-badge-container print:block hidden">
        {allVisitorsToDisplay.map((visitorItem, index) => (
          <div
            key={`print-${visitorItem.id || index}`}
            className="visitor-badge-page"
          >
            {/* Oberes Badge */}
            <div className="visitor-badge-top">
              <VisitorBadge
                visitor={visitorItem.isMain ? visitor : {
                  ...visitor,
                  name: visitorItem.name,
                  firstName: visitorItem.firstName,
                  visitorNumber: visitorItem.visitorNumber
                }}
                name={!visitorItem.isMain ? visitorItem.name : undefined}
                firstName={!visitorItem.isMain ? visitorItem.firstName : undefined}
                visitorNumber={!visitorItem.isMain ? visitorItem.visitorNumber : undefined}
                printTimestamp={printTimestamp}
                qrPosition={badgeLayout.qrCodePosition || 'right'}
                className="print-badge"
              />
            </div>
            
            {/* Trennlinie zwischen den Badges */}
            <div className="badge-divider"></div>
            
            {/* Unteres Badge (Duplikat) */}
            <div className="visitor-badge-bottom">
              <VisitorBadge
                visitor={visitorItem.isMain ? visitor : {
                  ...visitor,
                  name: visitorItem.name,
                  firstName: visitorItem.firstName,
                  visitorNumber: visitorItem.visitorNumber
                }}
                name={!visitorItem.isMain ? visitorItem.name : undefined}
                firstName={!visitorItem.isMain ? visitorItem.firstName : undefined}
                visitorNumber={!visitorItem.isMain ? visitorItem.visitorNumber : undefined}
                printTimestamp={printTimestamp}
                qrPosition={badgeLayout.qrCodePosition || 'right'}
                className="print-badge"
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Bildschirmvorschau - nur auf dem Bildschirm sichtbar */}
      <div className="print:hidden">
        {/* Vorschau des Hauptbesucher-Badges */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-2">Druckvorschau (A6-Format)</h2>
          <div className="border border-gray-300 rounded-md p-4 bg-white" style={{ 
            width: '105mm', 
            height: '148mm',
            margin: '0 auto',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            {/* Vorschau des oberen Badges */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}>
              <div style={{
                transform: `translate(${badgeOffsetX}mm, ${badgeOffsetY}mm) rotate(${badgeRotation}deg)`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease-in-out',
                scale: '0.7',
                width: '60mm',
                height: '69mm',
                boxSizing: 'border-box'
              }}>
                <VisitorBadge 
                  visitor={visitor} 
                  printTimestamp={printTimestamp}
                  qrPosition={badgeLayout.qrCodePosition || 'right'}
                  className="w-full h-full"
                />
              </div>
            </div>
            
            {/* Mittlere Trennlinie */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '0',
              width: '100%',
              borderTop: '1px dashed #ccc'
            }}></div>
            
            {/* Vorschau des unteren Badges */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '0',
              width: '100%',
              height: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}>
              <div style={{
                transform: `translate(${secondBadgeOffsetX}mm, ${secondBadgeOffsetY}mm) rotate(${secondBadgeRotation}deg)`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease-in-out',
                scale: '0.7',
                width: '60mm',
                height: '69mm',
                boxSizing: 'border-box'
              }}>
                <VisitorBadge 
                  visitor={visitor} 
                  printTimestamp={printTimestamp}
                  qrPosition={badgeLayout.qrCodePosition || 'right'}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Abschnitt für zusätzliche Besucher */}
        {hasAdditionalVisitors && (
          <div className="mt-8 mb-4">
            <h2 className="text-lg font-medium mb-4">Zusätzliche Besucher</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visitor.additionalVisitors.map((additionalVisitor) => (
                <div key={additionalVisitor.id} className="border border-gray-200 rounded-md p-4 bg-white">
                  <h3 className="text-md font-medium mb-2">{additionalVisitor.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">Besuchernummer: {additionalVisitor.visitorNumber}</p>
                  <VisitorBadge 
                    visitor={{
                      ...visitor,
                      name: additionalVisitor.name,
                      firstName: additionalVisitor.firstName,
                      visitorNumber: additionalVisitor.visitorNumber
                    }}
                    name={additionalVisitor.name}
                    firstName={additionalVisitor.firstName}
                    visitorNumber={additionalVisitor.visitorNumber}
                    printTimestamp={printTimestamp}
                    qrPosition={badgeLayout.qrCodePosition || 'right'}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgePrintPreview;
