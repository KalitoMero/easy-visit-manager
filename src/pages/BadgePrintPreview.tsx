import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import VisitorBadge from '@/components/VisitorBadge';
import { toast } from "@/hooks/use-toast";
import HomeButton from "@/components/HomeButton";
import { ensureQRCodesLoaded } from '@/lib/qrCodeUtils';

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
    showBrandingOnPrint,
    // Unterer Rand
    bottomMargin
  } = usePrinterSettings();
  const printAttemptedRef = useRef(false);
  const printTimestamp = useRef(new Date()).current;
  const [qrCodesLoaded, setQrCodesLoaded] = useState(false);
  const [qrLoadingAttempts, setQrLoadingAttempts] = useState(0);
  
  // Find the primary visitor
  const visitor = visitors.find(v => v.id === id);

  // Add global print styles to hide elements and control branding
  useEffect(() => {
    // Create style element for print styles
    const styleEl = document.createElement('style');
    styleEl.setAttribute('type', 'text/css');
    styleEl.textContent = `
      @media print {
        /* Hide standard UI elements when printing */
        body * {
          visibility: hidden;
        }
        
        /* Show only the badge container and its contents */
        .visitor-badge-container, .visitor-badge-container * {
          visibility: visible;
        }

        /* Direct container positioning */
        .visitor-badge-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 105mm;
          height: 148mm;
          padding-bottom: ${bottomMargin}mm; /* Apply bottom margin */
          box-sizing: border-box;
        }
        
        /* No border or background when printing */
        .visitor-badge {
          border: none !important;
          box-shadow: none !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Hide Lovable/Edit branding */
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

        /* Page settings for A6 */
        @page {
          size: 105mm 148mm;
          margin: 0;
        }
      }
    `;
    
    // Add styles to head
    document.head.appendChild(styleEl);
    
    // Cleanup function to remove styles
    return () => {
      document.head.removeChild(styleEl);
    };
  }, [bottomMargin]);

  // QR code loading event handler
  const handleQRCodeLoaded = () => {
    console.log("QR code loaded successfully in component");
    setQrCodesLoaded(true);
  };
  
  // Retry QR code generation if it fails
  useEffect(() => {
    if (!qrCodesLoaded && qrLoadingAttempts < 3 && visitor) {
      const timer = setTimeout(() => {
        console.log(`QR code loading attempt ${qrLoadingAttempts + 1}`);
        setQrLoadingAttempts(prev => prev + 1);
        // Force re-render to try loading QR code again
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [qrCodesLoaded, qrLoadingAttempts, visitor]);
  
  useEffect(() => {
    // Avoid multiple print attempts and wait for QR code to load
    if (visitor && !printAttemptedRef.current && enableAutomaticPrinting && qrCodesLoaded) {
      // Mark as attempted immediately to prevent duplicate printing
      printAttemptedRef.current = true;
      
      const printBadge = async () => {
        try {
          console.log("Starting print process - QR codes loaded:", qrCodesLoaded);
          
          // Wait for secure QR code generation with increased timeout
          await ensureQRCodesLoaded(() => {
            console.log("QR codes confirmed loaded via ensureQRCodesLoaded, proceeding with print");
          }, 5000);
          
          // Electron printing
          if (isElectron()) {
            console.log("Using Electron printing API");
            const result = await window.electronAPI.printBadge({
              id: visitor.id,
              name: visitor.name,
              printerName: selectedPrinterName,
              printOptions: {
                // First badge position
                rotation: badgeRotation,
                offsetX: badgeOffsetX,
                offsetY: badgeOffsetY,
                // Second badge position
                secondRotation: secondBadgeRotation,
                secondOffsetX: secondBadgeOffsetX,
                secondOffsetY: secondBadgeOffsetY,
                // Bottom margin
                bottomMargin: bottomMargin
              },
              layoutOptions: badgeLayout, // Pass badge layout options to Electron
              showBranding: showBrandingOnPrint // Pass branding option to Electron
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
            console.log("Using browser printing");
            // Browser printing
            const isKioskPrintingSupported = 
              window.navigator.userAgent.includes('Chrome') || 
              window.navigator.userAgent.includes('Chromium');
            
            if (printWithoutDialog && isKioskPrintingSupported) {
              console.log('Initiating kiosk print...');
              window.print();
            } else {
              // Fallback if no kiosk mode is active
              // or the user wants to see the print dialog
              console.log('Initiating fallback print with delay...');
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
      
      // Add a short delay before printing to ensure everything is rendered
      setTimeout(() => {
        printBadge();
      }, 500);
    }
  }, [visitor, enableAutomaticPrinting, printWithoutDialog, printDelay, selectedPrinterName, 
      printCopies, badgeRotation, badgeOffsetX, badgeOffsetY, secondBadgeRotation, 
      secondBadgeOffsetX, secondBadgeOffsetY, badgeLayout, showBrandingOnPrint, bottomMargin, qrCodesLoaded]);
  
  if (!visitor) {
    return (
      <div className="p-8 text-center">
        <HomeButton />
        <div className="mt-8">Visitor not found</div>
      </div>
    );
  }
  
  // For group visitors, create a badge for each visitor
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
            height: '74mm', /* Exactly half of A6 height */
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
                onQRCodeLoaded={handleQRCodeLoaded}
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
            height: '74mm', /* Exactly half of A6 height */
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
                onQRCodeLoaded={handleQRCodeLoaded}
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
                  onQRCodeLoaded={handleQRCodeLoaded}
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
                  onQRCodeLoaded={handleQRCodeLoaded}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Individual badges for additional visitors */}
        {visitor.additionalVisitors && visitor.additionalVisitors.length > 0 && visitor.additionalVisitors.map((additionalVisitor) => (
          <div key={additionalVisitor.id} className="mb-4">
            <h3 className="text-md font-medium mb-2">Zusätzlicher Besucher: {additionalVisitor.name}</h3>
            <VisitorBadge 
              visitor={visitor} 
              name={additionalVisitor.name}
              visitorNumber={additionalVisitor.visitorNumber}
              printTimestamp={printTimestamp}
              qrPosition={badgeLayout.qrCodePosition || 'right'}
              onQRCodeLoaded={handleQRCodeLoaded}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgePrintPreview;
