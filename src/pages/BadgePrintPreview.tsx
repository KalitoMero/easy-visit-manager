
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
import { preloadQRCodes } from '@/lib/qrCodeUtils';

// Create a print controller for this component
const printController = createPrintController();

const BadgePrintPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDirect = searchParams.get('direct') === 'true';
  const fromCheckin = searchParams.get('flow') === 'checkin';
  
  const visitors = useVisitorStore(state => state.visitors);
  const { toast } = useToast();
  
  // Printer settings
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
  
  // Status tracking with refs to prevent re-renders
  const printTimestamp = useRef(new Date()).current;
  const [printingCompleted, setPrintingCompleted] = useState(false);
  const printInitiatedRef = useRef(false);
  const redirectedRef = useRef(false);
  const loadedRef = useRef(false);
  const navigationAttemptedRef = useRef(false);
  
  // Find visitor
  const visitor = visitors.find(v => v.id === id);
  const hasAdditionalVisitors = visitor?.additionalVisitors && visitor.additionalVisitors.length > 0;

  // Prepare visitorNumbers array for QR code preloading
  const allVisitorNumbers = React.useMemo(() => {
    if (!visitor) return [];
    
    const numbers = [visitor.visitorNumber];
    if (visitor.additionalVisitors) {
      visitor.additionalVisitors.forEach(av => {
        if (av.visitorNumber) {
          numbers.push(av.visitorNumber);
        }
      });
    }
    return numbers;
  }, [visitor]);

  // Preload QR codes once when component mounts
  useEffect(() => {
    if (!visitor || loadedRef.current) return;
    
    const preload = async () => {
      await preloadQRCodes(allVisitorNumbers);
      loadedRef.current = true;
      logDebug('Print', 'Preloaded all QR codes successfully');
    };
    
    preload();
  }, [visitor, allVisitorNumbers]);

  // Add print styles
  useEffect(() => {
    // Reset print status when component mounts
    resetPrintStatus();
    printController.reset();
    
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
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 105mm !important; /* A6 width */
          height: 148mm !important; /* A6 height */
          padding: 0 !important;
          margin: 0 !important;
          padding-bottom: ${bottomMargin}mm !important; /* Apply bottom margin */
          box-sizing: border-box !important;
          overflow: hidden !important;
          page-break-after: always !important;
        }
        
        /* Ensure both badges are visible and correctly positioned */
        .visitor-badge-page {
          position: relative !important;
          width: 105mm !important;
          height: 148mm !important;
          page-break-after: always !important;
        }
        
        /* Position top badge with rotation */
        .visitor-badge-top {
          position: absolute !important;
          top: 5mm !important;
          left: 50% !important;
          transform: translateX(-50%) rotate(${badgeRotation}deg) translate(${badgeOffsetX}mm, ${badgeOffsetY}mm) !important;
          width: 60mm !important;
          height: 69mm !important;
          overflow: visible !important;
        }
        
        /* Position bottom badge with rotation */
        .visitor-badge-bottom {
          position: absolute !important;
          top: 74mm !important;
          left: 50% !important;
          transform: translateX(-50%) rotate(${secondBadgeRotation}deg) translate(${secondBadgeOffsetX}mm, ${secondBadgeOffsetY}mm) !important;
          width: 60mm !important;
          height: 69mm !important;
          overflow: visible !important;
        }
        
        /* Add divider line */
        .badge-divider {
          border-top: 1px dashed #999 !important;
          width: 100% !important;
          position: absolute !important;
          top: 74mm !important;
          left: 0 !important;
          visibility: visible !important;
        }
        
        /* Badge dimensions: exactly 60mm x 69mm */
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
          size: 105mm 148mm !important;
          margin: 0 !important;
        }
      }
    `;
    
    // Add styles to head
    document.head.appendChild(styleEl);
    
    // Cleanup
    return () => {
      document.head.removeChild(styleEl);
      // Reset print status when component unmounts
      resetPrintStatus();
      printController.reset();
    };
  }, [bottomMargin, badgeRotation, badgeOffsetX, badgeOffsetY, secondBadgeRotation, secondBadgeOffsetX, secondBadgeOffsetY]);
  
  // Function to safely navigate after printing
  const safeNavigateAfterPrint = () => {
    if (redirectedRef.current || !visitor) return;
    
    logDebug('Print', "Redirecting after printing");
    navigationAttemptedRef.current = true; // Mark that navigation was attempted to prevent multiple attempts
    
    // Reset controller and print status
    printController.reset();
    resetPrintStatus();
    
    // If opened directly, close window instead of navigating
    if (isDirect) {
      window.close();
    } else {
      // Navigate to success page directly
      navigate(`/checkin/step3/${visitor.id}`);
    }
    
    // Mark as redirected to prevent duplicate redirects
    redirectedRef.current = true;
  };
  
  // Force navigation after a fixed timeout to prevent getting stuck
  useEffect(() => {
    if (!visitor || !loadedRef.current || redirectedRef.current) return;

    // Force navigation after 5 seconds to prevent getting stuck in print preview
    const forceNavigationTimer = setTimeout(() => {
      if (!redirectedRef.current) {
        logDebug('Print', "Force navigating to success page after timeout");
        safeNavigateAfterPrint();
      }
    }, 3000); // 3 second safety timeout
    
    return () => clearTimeout(forceNavigationTimer);
  }, [visitor, loadedRef.current]);
  
  // Handle automatic printing - Execute once after loading
  useEffect(() => {
    // Skip if already initiated, completed, no visitor, or QR codes not loaded
    if (printInitiatedRef.current || printingCompleted || !visitor || !loadedRef.current) return;
    
    // Only trigger automatic printing if enabled or direct parameter is present
    if ((enableAutomaticPrinting || isDirect)) {
      logDebug('Print', "Starting automatic print process");
      
      // Mark as initiated to prevent duplicate calls
      printInitiatedRef.current = true;
      
      // Use print controller to prevent multiple prints
      if (printController.print()) {
        try {
          // Add short delay to ensure UI is fully rendered
          const printTimer = setTimeout(() => {
            if (isElectron()) {
              // Print via Electron API
              window.electronAPI.printBadge({
                id: visitor.id,
                name: visitor.name,
              }).then(() => {
                setPrintingCompleted(true);
                // Navigate after printing
                safeNavigateAfterPrint();
              }).catch((err) => {
                console.error("Electron print error:", err);
                setPrintingCompleted(true);
                // Still try to navigate on error
                safeNavigateAfterPrint();
              });
            } else {
              // Direct print with browser
              window.print();
              
              // Mark as completed immediately after print dialog shows
              setPrintingCompleted(true);
              
              // Navigate to success page immediately
              safeNavigateAfterPrint();
            }
          }, 300); // Short delay before printing to ensure everything is rendered
          
          return () => clearTimeout(printTimer);
        } catch (error) {
          console.error("Print error:", error);
          setPrintingCompleted(true);
          safeNavigateAfterPrint();
        }
      }
    }
  }, [visitor, enableAutomaticPrinting, isDirect, printingCompleted, loadedRef.current]);
  
  // Navigate after printing is completed
  useEffect(() => {
    if (printingCompleted && visitor && !redirectedRef.current) {
      // Add a tiny delay to ensure the print dialog has time to appear
      setTimeout(() => {
        safeNavigateAfterPrint();
      }, 50);
    }
  }, [printingCompleted, visitor]);
  
  // Prevent print loops after first print attempt
  useEffect(() => {
    // Add handler for afterprint event
    const handleAfterPrint = () => {
      logDebug('Print', 'afterprint event fired - Print dialog closed');
      setPrintingCompleted(true);
      // Navigate after print is complete - immediately
      safeNavigateAfterPrint();
    };
    
    window.addEventListener('afterprint', handleAfterPrint);
    
    // Remove handler when component unmounts
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);
  
  // Handle manual print
  const handleManualPrint = () => {
    if (printInitiatedRef.current || printingCompleted) {
      logDebug('Print', "Print already triggered, ignoring request");
      return;
    }
    
    toast({
      title: "Druckvorgang gestartet",
      description: "Das Druckfenster wird geöffnet...",
    });
    
    // Only print if print controller allows
    if (printController.print()) {
      printInitiatedRef.current = true;
      window.print();
      
      // Short delay before marking as complete
      setPrintingCompleted(true);
      
      // Navigate immediately to prevent getting stuck
      safeNavigateAfterPrint();
    }
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
  
  // Prepare array of all visitors to display (main visitor + additional)
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
      {/* UI controls - only visible on screen */}
      <div className="print:hidden">
        <HomeButton />
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Besucherausweis Druckvorschau</h2>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleManualPrint}
              variant="outline"
              className="flex items-center gap-2"
              disabled={printInitiatedRef.current || printingCompleted}
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
      
      {/* Badge container for printing - hidden on screen, visible when printing */}
      <div className="visitor-badge-container print:block hidden">
        {allVisitorsToDisplay.map((visitorItem, index) => (
          <div
            key={`print-${visitorItem.id || index}`}
            className="visitor-badge-page"
          >
            {/* Top badge */}
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
            
            {/* Divider line between badges */}
            <div className="badge-divider"></div>
            
            {/* Bottom badge (duplicate) */}
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
      
      {/* Screen preview - only visible on screen */}
      <div className="print:hidden">
        {/* Screen preview layout */}
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
