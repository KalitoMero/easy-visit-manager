
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import VisitorBadge from '@/components/VisitorBadge';
import { toast } from "@/hooks/use-toast";
import HomeButton from "@/components/HomeButton";
import { ensureQRCodesLoaded } from '@/lib/qrCodeUtils';
import { Button } from '@/components/ui/button';
import { Printer, QrCode } from 'lucide-react';

// Helper function to check if we're running in Electron
const isElectron = () => {
  return window && window.electronAPI && window.electronAPI.isElectron === true;
};

const BadgePrintPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  
  // Use refs to track printing status
  const printAttemptedRef = useRef(false);
  const printInProgressRef = useRef(false);
  const printTimestamp = useRef(new Date()).current;
  
  const [qrCodesLoaded, setQrCodesLoaded] = useState(false);
  const [qrLoadingAttempts, setQrLoadingAttempts] = useState(0);
  const [printingCompleted, setPrintingCompleted] = useState(false);
  const [manualPrintEnabled, setManualPrintEnabled] = useState(false);
  
  // Find the primary visitor
  const visitor = visitors.find(v => v.id === id);

  // When QR code is loaded
  const handleQRCodeLoaded = () => {
    console.log("QR code loaded successfully in BadgePrintPreview");
    setQrCodesLoaded(true);
  };
  
  // Retry QR code generation if it fails
  useEffect(() => {
    if (!qrCodesLoaded && qrLoadingAttempts < 5 && visitor) {
      const timer = setTimeout(() => {
        console.log(`QR code loading attempt ${qrLoadingAttempts + 1}`);
        setQrLoadingAttempts(prev => prev + 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    // Enable manual print option after a few attempts
    if (qrLoadingAttempts >= 3 && !manualPrintEnabled) {
      setManualPrintEnabled(true);
    }
  }, [qrCodesLoaded, qrLoadingAttempts, visitor, manualPrintEnabled]);
  
  // Add global print styles to control layout and optimize A6 usage
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

        /* Direct container positioning - full A6 width utilization */
        .visitor-badge-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 105mm; /* Exact A6 width */
          height: 148mm; /* Exact A6 height */
          padding: 0;
          margin: 0;
          padding-bottom: ${bottomMargin}mm; /* Apply bottom margin */
          box-sizing: border-box;
          overflow: hidden;
        }
        
        /* No border or background when printing */
        .visitor-badge {
          border: none !important;
          box-shadow: none !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          width: 105mm !important; /* Full width usage */
          padding: 1mm !important; /* Minimal inner padding to prevent content being cut off */
          box-sizing: border-box !important;
          overflow: visible !important;
          margin: 0 !important;
          height: 74mm !important; /* Exactly half of A6 height */
          max-height: 74mm !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
        }

        /* Maximize space usage for content */
        .badge-content {
          flex: 1 !important;
          display: flex !important;
          justify-content: space-between !important;
        }

        /* Minimize spacing for header and footer */
        .badge-header, .badge-footer {
          padding: 0.5mm 0 !important;
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
  
  // Handle printing logic
  useEffect(() => {
    // Check if we've already attempted printing or if requirements aren't met
    if (!visitor || printAttemptedRef.current || !enableAutomaticPrinting || printInProgressRef.current || printingCompleted) {
      return;
    }
    
    // Wait for QR codes to be loaded before attempting to print
    if (!qrCodesLoaded && qrLoadingAttempts < 5) {
      console.log("Waiting for QR codes to load before printing...");
      return;
    }
    
    // Mark as attempted immediately to prevent duplicate printing
    printAttemptedRef.current = true;
    
    const printBadge = async () => {
      try {
        // Set print in progress flag to prevent multiple calls
        printInProgressRef.current = true;
        console.log("Starting print process - QR codes loaded:", qrCodesLoaded);
        
        // Wait for secure QR code generation with increased timeout
        await ensureQRCodesLoaded(() => {
          console.log("QR codes confirmed loaded via ensureQRCodesLoaded, proceeding with print");
        }, 5000);
        
        // Add a delay to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, Math.max(printDelay, 1000)));
        
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
            setPrintingCompleted(true);
          } else {
            console.error('Electron print failed:', result.message);
            // Fallback to browser printing - only once
            window.print();
            setPrintingCompleted(true);
          }
        } else {
          // Browser printing - only happens once due to flags
          console.log("Using browser printing");
          window.print();
          setPrintingCompleted(true);
        }
      } catch (error) {
        console.error('Print error:', error);
        toast({
          title: "Fehler beim Drucken",
          description: "Der Ausweis konnte nicht automatisch gedruckt werden. Bitte versuchen Sie manuell zu drucken.",
          variant: "destructive"
        });
        setManualPrintEnabled(true);
      } finally {
        // Reset the in-progress flag but keep the attempted flag
        printInProgressRef.current = false;
      }
    };
    
    // Start print process after a small delay to ensure UI is ready
    setTimeout(() => {
      printBadge();
    }, 500);
  }, [visitor, enableAutomaticPrinting, printWithoutDialog, printDelay, selectedPrinterName, 
      printCopies, badgeRotation, badgeOffsetX, badgeOffsetY, secondBadgeRotation, 
      secondBadgeOffsetX, secondBadgeOffsetY, badgeLayout, showBrandingOnPrint, bottomMargin, 
      qrCodesLoaded, qrLoadingAttempts, printingCompleted]);
  
  // Handle manual print button click
  const handleManualPrint = () => {
    if (printInProgressRef.current) return;
    
    toast({
      title: "Druckvorgang gestartet",
      description: "Das Druckfenster wird geöffnet...",
    });
    
    // Set status and print
    printInProgressRef.current = true;
    setTimeout(() => {
      window.print();
      setPrintingCompleted(true);
      printInProgressRef.current = false;
    }, 500);
  };
  
  // Return to check-in success page
  const handleReturn = () => {
    if (visitor) {
      navigate(`/checkin/step3/${visitor.id}`);
    } else {
      navigate('/');
    }
  };
  
  if (!visitor) {
    return (
      <div className="p-8 text-center">
        <HomeButton />
        <div className="mt-8">Visitor not found</div>
      </div>
    );
  }
  
  return (
    <div className="p-4 flex flex-col gap-4 print:p-0">
      {/* Add HomeButton for navigation, visible only on screen */}
      <div className="print:hidden">
        <HomeButton />
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Besucherausweis Druckvorschau</h2>
          
          <div className="flex gap-2">
            {manualPrintEnabled && (
              <Button 
                onClick={handleManualPrint}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Manuell drucken
              </Button>
            )}
            
            <Button 
              onClick={handleReturn}
              variant="ghost"
            >
              Zurück
            </Button>
          </div>
        </div>
        
        {!qrCodesLoaded && qrLoadingAttempts > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">QR-Code wird geladen...</p>
              <p className="text-sm text-amber-700">Bitte warten Sie, bis der QR-Code vollständig geladen ist ({qrLoadingAttempts}/5 Versuche)</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Visitor badge container for A6 page - optimized for printing */}
      <div className="visitor-badge-container print:block hidden">
        <div className="a6-paper" style={{ 
          width: '105mm', 
          height: '148mm',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          padding: 0,
          margin: 0
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
            overflow: 'hidden',
            padding: 0,
            margin: 0
          }}>
            <div style={{
              transform: `translate(${badgeOffsetX}mm, ${badgeOffsetY}mm) rotate(${badgeRotation}deg)`,
              width: '100%',
              height: '100%',
              maxHeight: '74mm',
              boxSizing: 'border-box'
            }}>
              <VisitorBadge 
                visitor={visitor} 
                printTimestamp={printTimestamp}
                qrPosition={badgeLayout.qrCodePosition || 'right'}
                className="print-badge w-full h-full"
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
            overflow: 'hidden',
            padding: 0,
            margin: 0
          }}>
            <div style={{
              transform: `translate(${secondBadgeOffsetX}mm, ${secondBadgeOffsetY}mm) rotate(${secondBadgeRotation}deg)`,
              width: '100%',
              height: '100%',
              maxHeight: '74mm',
              boxSizing: 'border-box'
            }}>
              <VisitorBadge 
                visitor={visitor} 
                printTimestamp={printTimestamp}
                qrPosition={badgeLayout.qrCodePosition || 'right'}
                className="print-badge w-full h-full"
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
                width: '100%',
                height: '100%',
                boxSizing: 'border-box'
              }}>
                <VisitorBadge 
                  visitor={visitor} 
                  printTimestamp={printTimestamp}
                  qrPosition={badgeLayout.qrCodePosition || 'right'}
                  className="w-full h-full"
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
                width: '100%',
                height: '100%',
                boxSizing: 'border-box'
              }}>
                <VisitorBadge 
                  visitor={visitor} 
                  printTimestamp={printTimestamp}
                  qrPosition={badgeLayout.qrCodePosition || 'right'}
                  className="w-full h-full"
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
