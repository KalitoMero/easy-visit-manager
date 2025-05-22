
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const isDirect = searchParams.get('direct') === 'true';
  
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
  const [mainQrLoaded, setMainQrLoaded] = useState(false);
  const [additionalQrsLoaded, setAdditionalQrsLoaded] = useState({});
  
  // Find the visitor
  const visitor = visitors.find(v => v.id === id);
  const hasAdditionalVisitors = visitor?.additionalVisitors && visitor.additionalVisitors.length > 0;

  // QR code load handler for main visitor
  const handleMainQRCodeLoaded = () => {
    logDebug('Print', "Main visitor QR code loaded successfully");
    setMainQrLoaded(true);
    checkAllQrCodesLoaded();
  };
  
  // QR code load handler for additional visitors
  const handleAdditionalQRCodeLoaded = (visitorId) => {
    logDebug('Print', `Additional visitor QR code loaded for ${visitorId}`);
    setAdditionalQrsLoaded(prev => ({...prev, [visitorId]: true}));
    checkAllQrCodesLoaded();
  };
  
  // Check if all QR codes are loaded
  const checkAllQrCodesLoaded = () => {
    if (!visitor) return;
    
    // Check main visitor QR code
    if (!mainQrLoaded) return;
    
    // If there are additional visitors, check their QR codes too
    if (hasAdditionalVisitors) {
      const allAdditionalLoaded = visitor.additionalVisitors.every(
        av => additionalQrsLoaded[av.id]
      );
      if (!allAdditionalLoaded) return;
    }
    
    // All QR codes are loaded
    setQrCodesLoaded(true);
    logDebug('Print', "All QR codes loaded successfully");
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
        // If this was opened directly, close the window instead of navigating
        if (isDirect) {
          window.close();
        } else {
          navigate(`/checkin/step3/${visitor.id}`);
        }
      }, 1000); // Give time to ensure print dialog has processed
      
      return () => clearTimeout(redirectTimer);
    }
  }, [printingCompleted, visitor, navigate, isDirect]);
  
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
  if (
    !visitor ||
    printAttemptedRef.current ||
    !enableAutomaticPrinting ||
    printInProgressRef.current ||
    printingCompleted
  ) return;

  if (!qrCodesLoaded) return;

  printAttemptedRef.current = true;

  const printBadge = async () => {
    printInProgressRef.current = true;
    try {
      await new Promise(resolve => setTimeout(resolve, Math.max(printDelay, 1000)));
      if (isElectron()) {
        const result = await window.electronAPI.printBadge({
          id: visitor.id,
          name: visitor.name,
        });
        setPrintingCompleted(true);
      } else {
        window.print();
        setPrintingCompleted(true);
      }
    } catch {
      setPrintingCompleted(true);
    } finally {
      printInProgressRef.current = false;
    }
  };

  printBadge();
}, [visitor, enableAutomaticPrinting, printDelay, qrCodesLoaded]);
  
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
        <div className="mt-8">Besucher nicht gefunden</div>
      </div>
    );
  }
  
  // Prepare array of all visitors to print (main visitor + additionals)
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
              <p className="font-medium text-amber-800">QR-Codes werden geladen...</p>
              <p className="text-sm text-amber-700">Bitte warten Sie, bis alle QR-Codes vollständig geladen sind ({qrLoadingAttempts}/5 Versuche)</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Badge containers for printing - hidden on screen, visible when printing */}
      <div className="visitor-badge-container print:block hidden">
        {allVisitorsToDisplay.map((visitorItem, index) => (
          <div 
            key={`print-${visitorItem.id || index}`}
            className="visitor-page-container"
            style={{ 
              width: '105mm', 
              height: '148mm',
              position: 'relative',
              overflow: 'hidden',
              boxSizing: 'border-box',
              padding: 0,
              margin: 0,
              pageBreakAfter: 'always'
            }}
          >
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
                  onQRCodeLoaded={visitorItem.isMain ? handleMainQRCodeLoaded : () => handleAdditionalQRCodeLoaded(visitorItem.id)}
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
                  onQRCodeLoaded={visitorItem.isMain ? handleMainQRCodeLoaded : () => handleAdditionalQRCodeLoaded(visitorItem.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Screen preview - visible only on screen */}
      <div className="print:hidden">
        {/* Main visitor badge preview */}
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
                  onQRCodeLoaded={handleMainQRCodeLoaded}
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
                  onQRCodeLoaded={handleMainQRCodeLoaded}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional visitors section */}
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
                    onQRCodeLoaded={() => handleAdditionalQRCodeLoaded(additionalVisitor.id)}
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
