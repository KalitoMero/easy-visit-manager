
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import VisitorBadge from '@/components/VisitorBadge';
import { useToast } from "@/hooks/use-toast";
import HomeButton from "@/components/HomeButton";
import { ensureQRCodesLoaded } from '@/lib/qrCodeUtils';
import { Button } from '@/components/ui/button';
import { Printer, QrCode } from 'lucide-react';
import { logDebug } from '@/lib/debugUtils';
import { isElectron } from '@/lib/htmlBadgePrinter';

const BadgePrintPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const visitors = useVisitorStore(state => state.visitors);
  const { toast } = useToast();
  
  // Printer settings
  const { 
    enableAutomaticPrinting, 
    printDelay,
    badgeRotation,
    badgeOffsetX,
    badgeOffsetY,
    secondBadgeRotation,
    secondBadgeOffsetX,
    secondBadgeOffsetY,
    badgeLayout,
    bottomMargin
  } = usePrinterSettings();
  
  // Status tracking
  const printAttemptedRef = useRef(false);
  const printInProgressRef = useRef(false);
  const printTimestamp = useRef(new Date()).current;
  const redirectAttemptedRef = useRef(false);
  
  const [qrCodesLoaded, setQrCodesLoaded] = useState(false);
  const [qrLoadingAttempts, setQrLoadingAttempts] = useState(0);
  const [printingCompleted, setPrintingCompleted] = useState(false);
  const [manualPrintEnabled, setManualPrintEnabled] = useState(false);
  
  // Find the visitor
  const visitor = visitors.find(v => v.id === id);

  // QR code load handler
  const handleQRCodeLoaded = () => {
    logDebug('Print', "QR code loaded successfully in BadgePrintPreview");
    setQrCodesLoaded(true);
  };
  
  // Retry QR code loading
  useEffect(() => {
    if (!qrCodesLoaded && qrLoadingAttempts < 5 && visitor) {
      const timer = setTimeout(() => {
        logDebug('Print', `QR code loading attempt ${qrLoadingAttempts + 1}`);
        setQrLoadingAttempts(prev => prev + 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    // Enable manual print after a few attempts
    if (qrLoadingAttempts >= 3 && !manualPrintEnabled) {
      setManualPrintEnabled(true);
    }
  }, [qrCodesLoaded, qrLoadingAttempts, visitor, manualPrintEnabled]);

  // Redirect after printing is completed
  useEffect(() => {
    if (printingCompleted && visitor && !redirectAttemptedRef.current) {
      redirectAttemptedRef.current = true;
      
      // Set a timer to redirect back to the success page
      const redirectTimer = setTimeout(() => {
        logDebug('Print', "Redirecting to success page after printing");
        navigate(`/checkin/step3/${visitor.id}`);
      }, 800); // Give a short delay to ensure print dialog has time to process
      
      return () => clearTimeout(redirectTimer);
    }
  }, [printingCompleted, visitor, navigate]);
  
  // Add print styles
  useEffect(() => {
    // Create style element for print styles
    const styleEl = document.createElement('style');
    styleEl.setAttribute('type', 'text/css');
    styleEl.textContent = `
      @media print {
        /* Hide UI elements when printing */
        body * {
          visibility: hidden;
        }
        
        /* Show only the badge container and its contents */
        .visitor-badge-container, .visitor-badge-container * {
          visibility: visible;
        }

        /* Position container for A6 paper */
        .visitor-badge-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 105mm; /* A6 width */
          height: 148mm; /* A6 height */
          padding: 0;
          margin: 0;
          padding-bottom: ${bottomMargin}mm; /* Apply bottom margin */
          box-sizing: border-box;
          overflow: hidden;
          page-break-after: always;
        }
        
        /* Badge dimensions: exactly 60mm x 90mm */
        .visitor-badge {
          width: 60mm !important;
          height: 90mm !important;
          margin: 0 !important;
          padding: 1mm !important;
          box-sizing: border-box !important;
          overflow: visible !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* Badge content layout */
        .badge-content {
          flex: 1 !important;
          display: flex !important;
          justify-content: space-between !important;
        }

        /* Hide Lovable branding */
        .lovable-badge, 
        [data-lovable-badge="true"],
        #lovable-badge-root,
        [class*="lovable-badge"],
        [id*="lovable-editor"],
        [data-testid="badge-root"] {
          display: none !important;
          visibility: hidden !important;
        }

        /* A6 page settings */
        @page {
          size: 105mm 148mm;
          margin: 0;
        }
      }
    `;
    
    // Add styles to head
    document.head.appendChild(styleEl);
    
    // Cleanup
    return () => {
      document.head.removeChild(styleEl);
    };
  }, [bottomMargin]);
  
  // Handle automatic printing
  useEffect(() => {
    // Skip if requirements aren't met
    if (!visitor || printAttemptedRef.current || !enableAutomaticPrinting || printInProgressRef.current || printingCompleted) {
      return;
    }
    
    // Wait for QR codes
    if (!qrCodesLoaded && qrLoadingAttempts < 5) {
      logDebug('Print', "Waiting for QR codes to load before printing...");
      return;
    }
    
    // Mark as attempted to prevent duplicate printing
    printAttemptedRef.current = true;
    
    const printBadge = async () => {
      try {
        // Set print in progress flag
        printInProgressRef.current = true;
        logDebug('Print', "Starting print process");
        
        // Wait for QR codes to be fully loaded
        await ensureQRCodesLoaded(() => {
          logDebug('Print', "QR codes confirmed loaded, proceeding with print");
        }, 5000);
        
        // Add delay for rendering
        await new Promise(resolve => setTimeout(resolve, Math.max(printDelay, 1000)));
        
        // Electron or browser printing
        if (isElectron()) {
          logDebug('Print', "Using Electron printing API");
          const result = await window.electronAPI.printBadge({
            id: visitor.id,
            name: visitor.name,
            // Include necessary print options
          });
          
          if (result.success) {
            logDebug('Print', 'Badge printed successfully through Electron');
            setPrintingCompleted(true);
          } else {
            logDebug('Print', 'Electron print failed, falling back to browser printing');
            // Fallback to browser printing
            window.print();
            setPrintingCompleted(true);
          }
        } else {
          // Browser printing
          logDebug('Print', "Using browser print function");
          window.print();
          setPrintingCompleted(true);
        }
      } catch (error) {
        logDebug('Print', 'Print error:', error);
        toast({
          title: "Fehler beim Drucken",
          description: "Der Ausweis konnte nicht automatisch gedruckt werden. Bitte versuchen Sie manuell zu drucken.",
          variant: "destructive"
        });
        setManualPrintEnabled(true);
      } finally {
        // Reset in-progress flag
        printInProgressRef.current = false;
      }
    };
    
    // Start print with small delay
    setTimeout(() => {
      printBadge();
    }, 500);
  }, [visitor, enableAutomaticPrinting, printDelay, qrCodesLoaded, qrLoadingAttempts, printingCompleted, toast]);
  
  // Handle manual print
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
  
  // Return to success page
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
      {/* UI controls - visible only on screen */}
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
      
      {/* Badge container for A6 printing - hidden on screen, visible when printing */}
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
          {/* Top badge - exactly 6cm × 9cm */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '72mm', /* 9cm */
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
              width: '60mm', /* 6cm */
              height: '72mm', /* 9cm */
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
          
          {/* Bottom badge - exactly 6cm × 9cm */}
          <div style={{
            position: 'absolute',
            top: '72mm', /* Position below the first badge */
            left: '0',
            width: '100%',
            height: '72mm', /* 9cm */
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
              width: '60mm', /* 6cm */
              height: '72mm', /* 9cm */
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
      
      {/* Screen preview - visible only on screen */}
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
                height: '72mm',
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
              top: '50%',
              left: '0',
              width: '100%',
              borderTop: '1px dashed #ccc'
            }}></div>
            
            {/* Bottom badge preview */}
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
                height: '72mm',
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
        
        {/* Additional visitors section */}
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
