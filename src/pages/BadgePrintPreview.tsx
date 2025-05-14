
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import VisitorBadge from '@/components/VisitorBadge';
import { toast } from "@/hooks/use-toast";
import HomeButton from "@/components/HomeButton";

// Helper function to check if we're running in Electron
const isElectron = () => {
  return window && window.electronAPI && window.electronAPI.isElectron === true;
};

const BadgePrintPreview = () => {
  const { id } = useParams<{ id: string }>();
  const visitors = useVisitorStore(state => state.visitors);
  const { 
    enableAutomaticPrinting, 
    printWithoutDialog, 
    printDelay,
    selectedPrinterName,
    printCopies,
    // Besucherausweis-Optionen
    badgeRotation,
    badgeOffsetX,
    badgeOffsetY,
    // Zweiter Ausweis (unten)
    secondBadgeRotation,
    secondBadgeOffsetX,
    secondBadgeOffsetY,
    // Badge layout
    badgeLayout,
    // Branding-Option
    showBrandingOnPrint
  } = usePrinterSettings();
  const printAttemptedRef = useRef(false);
  const printTimestamp = useRef(new Date()).current;
  
  // Find the primary visitor
  const visitor = visitors.find(v => v.id === id);

  // Add global print styles to hide elements and control branding
  useEffect(() => {
    // Erstelle ein style-Element für die Print-Styles
    const styleEl = document.createElement('style');
    styleEl.setAttribute('type', 'text/css');
    styleEl.textContent = `
      @media print {
        /* Verstecke Standard-UI-Elemente beim Drucken */
        body * {
          visibility: hidden;
        }
        
        /* Zeige nur die Badge-Container und deren Inhalte an */
        .visitor-badge-container, .visitor-badge-container * {
          visibility: visible;
        }

        /* Container direkt positionieren */
        .visitor-badge-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 105mm;
          height: 148mm;
        }
        
        /* Kein Rand und kein Hintergrund beim Drucken */
        .visitor-badge {
          border: none !important;
          box-shadow: none !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Lovable/Edit-Branding verstecken */
        .lovable-badge, 
        [data-lovable-badge="true"],
        #lovable-badge-root,
        [class*="lovable-badge"],
        [id*="lovable-editor"],
        [data-testid="badge-root"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
          position: absolute !important;
          pointer-events: none !important;
          z-index: -9999 !important;
        }

        /* Seiteneinstellungen für A6 */
        @page {
          size: 105mm 148mm;
          margin: 0;
        }
      }
    `;
    
    // Füge die Styles zum Head hinzu
    document.head.appendChild(styleEl);
    
    // Bereinigungsfunktion zum Entfernen der Styles
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  useEffect(() => {
    // Vermeidung mehrfacher Druckversuche
    if (visitor && !printAttemptedRef.current && enableAutomaticPrinting) {
      printAttemptedRef.current = true;
      
      const printBadge = async () => {
        try {
          // Electron printing
          if (isElectron()) {
            const result = await window.electronAPI.printBadge({
              id: visitor.id,
              name: visitor.name,
              printerName: selectedPrinterName,
              printOptions: {
                // Erste Badge-Position
                rotation: badgeRotation,
                offsetX: badgeOffsetX,
                offsetY: badgeOffsetY,
                // Zweite Badge-Position
                secondRotation: secondBadgeRotation,
                secondOffsetX: secondBadgeOffsetX,
                secondOffsetY: secondBadgeOffsetY
              },
              layoutOptions: badgeLayout, // Pass badge layout options to Electron
              showBranding: showBrandingOnPrint // Neue Branding-Option an Electron übergeben
            });
            
            if (result.success) {
              console.log('Badge printed successfully through Electron');
            } else {
              console.error('Electron print failed:', result.message);
              // Fallback to browser printing
              setTimeout(() => {
                window.print();
              }, printDelay);
            }
          } else {
            // Browser printing
            const isKioskPrintingSupported = 
              window.navigator.userAgent.includes('Chrome') || 
              window.navigator.userAgent.includes('Chromium');
            
            if (printWithoutDialog && isKioskPrintingSupported) {
              console.log('Kiosk-Druck wird initiiert...');
              window.print();
            } else {
              // Fallback für den Fall, dass kein Kiosk-Modus aktiv ist
              // oder der Nutzer möchte den Druckdialog sehen
              console.log('Fallback-Druck mit Verzögerung wird initiiert...');
              const timer = setTimeout(() => {
                window.print();
              }, printDelay);
              
              return () => clearTimeout(timer);
            }
          }
        } catch (error) {
          console.error('Print error:', error);
          toast({
            title: "Fehler beim Drucken",
            description: "Der Ausweis konnte nicht automatisch gedruckt werden. Bitte versuchen Sie manuell zu drucken.",
            variant: "destructive"
          });
          
          // Fallback
          setTimeout(() => {
            window.print();
          }, printDelay);
        }
      };
      
      printBadge();
    }
  }, [visitor, enableAutomaticPrinting, printWithoutDialog, printDelay, selectedPrinterName, printCopies, 
      badgeRotation, badgeOffsetX, badgeOffsetY, 
      secondBadgeRotation, secondBadgeOffsetX, secondBadgeOffsetY, badgeLayout, showBrandingOnPrint]);
  
  if (!visitor) {
    return (
      <div className="p-8 text-center">
        <HomeButton />
        <div className="mt-8">Visitor not found</div>
      </div>
    );
  }
  
  // Für Gruppenbesucher, erstelle einen Ausweis für jeden Besucher
  const hasAdditionalVisitors = visitor.additionalVisitors && visitor.additionalVisitors.length > 0;
  
  return (
    <div className="p-4 flex flex-col gap-4 print:p-0">
      {/* Add HomeButton for navigation, visible only on screen */}
      <div className="print:hidden">
        <HomeButton />
      </div>
      
      {/* Visitor badge container for A6 page */}
      <div className="visitor-badge-container print:block hidden">
        <div className="a6-paper" style={{ 
          width: '105mm', 
          height: '148mm',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}>
          {/* Top badge with custom position and rotation */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '74mm', /* Exakt die Hälfte von A6-Höhe */
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            <div style={{
              transform: `translate(${badgeOffsetX}mm, ${badgeOffsetY}mm) rotate(${badgeRotation}deg)`,
              maxWidth: '100%',
              maxHeight: '74mm',
              boxSizing: 'border-box'
            }}>
              <VisitorBadge 
                visitor={visitor} 
                printTimestamp={printTimestamp}
                qrPosition={badgeLayout.qrCodePosition || 'right'}
                className="print-badge"
              />
            </div>
          </div>
          
          {/* Divider line */}
          <div style={{
            position: 'absolute',
            top: '74mm',
            left: '0',
            width: '100%',
            borderTop: '1px dashed #ccc'
          }}></div>
          
          {/* Bottom badge with custom position and rotation */}
          <div style={{
            position: 'absolute',
            top: '74mm',
            left: '0',
            width: '100%',
            height: '74mm', /* Exakt die Hälfte von A6-Höhe */
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}>
            <div style={{
              transform: `translate(${secondBadgeOffsetX}mm, ${secondBadgeOffsetY}mm) rotate(${secondBadgeRotation}deg)`,
              maxWidth: '100%',
              maxHeight: '74mm',
              boxSizing: 'border-box'
            }}>
              <VisitorBadge 
                visitor={visitor} 
                printTimestamp={printTimestamp}
                qrPosition={badgeLayout.qrCodePosition || 'right'}
                className="print-badge"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Screen preview (not for printing) - shows only regular badges */}
      <div className="print:hidden">
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
            {/* Top badge preview */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '74mm',
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
                maxHeight: '74mm',
                boxSizing: 'border-box'
              }}>
                <VisitorBadge 
                  visitor={visitor} 
                  printTimestamp={printTimestamp}
                  qrPosition={badgeLayout.qrCodePosition || 'right'}
                />
              </div>
            </div>
            
            {/* Middle divider */}
            <div style={{
              position: 'absolute',
              top: '74mm',
              left: '0',
              width: '100%',
              borderTop: '1px dashed #ccc'
            }}></div>
            
            {/* Bottom badge preview */}
            <div style={{
              position: 'absolute',
              top: '74mm',
              left: '0',
              width: '100%',
              height: '74mm',
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
                maxHeight: '74mm',
                boxSizing: 'border-box'
              }}>
                <VisitorBadge 
                  visitor={visitor} 
                  printTimestamp={printTimestamp}
                  qrPosition={badgeLayout.qrCodePosition || 'right'}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Individual badges for additional visitors */}
        {hasAdditionalVisitors && visitor.additionalVisitors?.map((additionalVisitor) => (
          <div key={additionalVisitor.id} className="mb-4">
            <h3 className="text-md font-medium mb-2">Zusätzlicher Besucher: {additionalVisitor.name}</h3>
            <VisitorBadge 
              visitor={visitor} 
              name={additionalVisitor.name}
              visitorNumber={additionalVisitor.visitorNumber}
              printTimestamp={printTimestamp}
              qrPosition={badgeLayout.qrCodePosition || 'right'}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgePrintPreview;
