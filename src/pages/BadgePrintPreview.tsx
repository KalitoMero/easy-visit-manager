import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import VisitorBadge from '@/components/VisitorBadge';
import { useToast } from "@/hooks/use-toast";
import HomeButton from "@/components/HomeButton";
import { Button } from '@/components/ui/button';
import { Printer, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { logDebug } from '@/lib/debugUtils';
import { createPrintController, resetPrintStatus } from '@/lib/htmlBadgePrinter';
import { preloadQRCodes } from '@/lib/qrCodeUtils';

// Create a print controller for this component
const printController = createPrintController();

// Storage key for tracking print status across page visits
const PRINT_HISTORY_KEY = 'visitor-print-history';

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
  
  // Status tracking with refs to avoid re-renders
  const printTimestamp = useRef(new Date()).current;
  const printInitiatedRef = useRef(false);
  const redirectedRef = useRef(false);
  
  // State to track which visitor badge is currently being previewed
  const [currentVisitorIndex, setCurrentVisitorIndex] = useState(0);
  
  // Find visitor
  const visitor = visitors.find(v => v.id === id);
  const hasAdditionalVisitors = visitor?.additionalVisitors && visitor.additionalVisitors.length > 0;

  // Prepare all visitors for display and printing
  const allVisitorsToDisplay = React.useMemo(() => {
    if (!visitor) return [];
    
    return [
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
  }, [visitor]);
  
  // Get current visitor for preview
  const currentVisitor = allVisitorsToDisplay[currentVisitorIndex] || allVisitorsToDisplay[0];
  
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
  
  // Check if this visitor has been recently printed
  const hasBeenRecentlyPrinted = () => {
    try {
      const printHistory = JSON.parse(localStorage.getItem(PRINT_HISTORY_KEY) || '{}');
      if (!printHistory[id]) return false;
      
      const elapsedTime = Date.now() - printHistory[id];
      return elapsedTime < 10000; // 10 seconds
    } catch (e) {
      return false;
    }
  };

  // Record print in history
  const recordPrint = () => {
    try {
      const printHistory = JSON.parse(localStorage.getItem(PRINT_HISTORY_KEY) || '{}');
      printHistory[id] = Date.now();
      localStorage.setItem(PRINT_HISTORY_KEY, JSON.stringify(printHistory));
    } catch (e) {
      // Ignore errors
    }
  };

  // Reset all print statuses when component mounts
  useEffect(() => {
    // Completely reset print state when component mounts
    resetPrintStatus();
    printController.reset();
    printInitiatedRef.current = false;
    redirectedRef.current = false;
    
    // Check if we've already printed this visitor recently
    if (hasBeenRecentlyPrinted() && !isDirect) {
      logDebug('Print', '⚠️ Recent print detected - skipping automatic print');
      // Don't trigger print again, just wait for user action
    }
    
    // Force navigation safety timeout (very short - 1 second)
    const forceNavigationTimer = setTimeout(() => {
      if (!redirectedRef.current && visitor) {
        logDebug('Print', '⚠️ FORCE NAVIGATION: Safety timeout triggered');
        safeNavigateAfterPrint();
      }
    }, 3000); // 3 second safety timeout
    
    return () => {
      clearTimeout(forceNavigationTimer);
      // Reset print status when component unmounts
      resetPrintStatus();
      printController.reset();
    };
  }, []);

  // Navigate immediately function - centralized navigation logic
  const safeNavigateAfterPrint = () => {
    if (redirectedRef.current || !visitor) return;
    
    logDebug('Print', "⚠️ NAVIGATING: Redirecting after printing");
    
    redirectedRef.current = true; // Mark as redirected to prevent multiple navigations
    
    // Reset controller and print status
    printController.reset();
    resetPrintStatus();
    
    // Record this print in history
    recordPrint();
    
    // If opened directly, close window instead of navigating
    if (isDirect) {
      window.close();
    } else {
      // Add fromPrint parameter to indicate we're coming from print flow
      navigate(`/checkin/step3/${visitor.id}?fromPrint=true`);
    }
  };
  
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
          z-index: 9999 !important;
          background-color: white !important;
        }
        
        /* Badge dimensions and positioning settings */
        .visitor-badge-page {
          position: relative !important;
          width: 105mm !important;
          height: 148mm !important;
          page-break-after: always !important;
          background-color: white !important;
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
        
        /* Hide divider line when printing */
        .badge-divider {
          display: none !important;
          visibility: hidden !important;
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
    };
  }, [bottomMargin, badgeRotation, badgeOffsetX, badgeOffsetY, secondBadgeRotation, secondBadgeOffsetX, secondBadgeOffsetY]);
  
  // Handle afterprint event - navigation trigger
  useEffect(() => {
    const handleAfterPrint = () => {
      logDebug('Print', '✅ afterprint event fired - Print dialog closed');
      
      // Navigate immediately after print dialog closed
      if (visitor && !redirectedRef.current) {
        safeNavigateAfterPrint();
      }
    };
    
    window.addEventListener('afterprint', handleAfterPrint);
    
    // Remove handler when component unmounts
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [visitor]);

  // Simplified print function - no delays, no Electron
  const handlePrintProcess = () => {
    // Skip if already initiated or no visitor
    if (printInitiatedRef.current || !visitor) {
      return;
    }
    
    logDebug('Print', "▶️ Starting print process");
    printInitiatedRef.current = true;
    
    try {
      // Direct browser printing only
      window.print();
      logDebug('Print', "✅ Browser print dialog shown");
      
      // For direct windows, navigate immediately
      if (isDirect) {
        safeNavigateAfterPrint();
      }
      // Regular print page relies on afterprint event
    } catch (error) {
      console.error("❌ Print error:", error);
      safeNavigateAfterPrint(); // Always navigate even if error
    }
  };
  
  // Auto-print when component mounts (if enabled)
  useEffect(() => {
    // Check if automatic printing should be done
    if (!printInitiatedRef.current && visitor && (enableAutomaticPrinting || isDirect)) {
      // Skip if we've printed this visitor recently unless forced via direct=true
      if (hasBeenRecentlyPrinted() && !isDirect) {
        logDebug('Print', '⚠️ Recent print detected - skipping automatic print');
        return;
      }
      
      // Load QR codes first
      const loadQRs = async () => {
        try {
          await preloadQRCodes(allVisitorNumbers);
          logDebug('Print', 'QR codes preloaded - starting auto-print');
          
          // Add a small delay to ensure DOM is fully rendered
          setTimeout(() => {
            handlePrintProcess();
          }, 300);
        } catch (error) {
          console.error('QR preload error:', error);
          // Print anyway even if QR loading fails - with delay
          setTimeout(() => {
            handlePrintProcess();
          }, 300);
        }
      };
      
      loadQRs();
    }
  }, [visitor, enableAutomaticPrinting, isDirect, allVisitorNumbers]);
  
  // Handle manual print button click
  const handleManualPrint = () => {
    toast({
      title: "Druckvorgang gestartet",
      description: "Das Druckfenster wird geöffnet...",
    });
    
    handlePrintProcess();
  };
  
  // Return to success page
  const handleReturn = () => {
    if (visitor) {
      // Record this as printed before returning
      recordPrint();
      navigate(`/checkin/step3/${visitor.id}?fromPrint=true`);
    } else {
      navigate('/');
    }
  };
  
  // Navigate to previous visitor badge
  const showPreviousBadge = () => {
    if (currentVisitorIndex > 0) {
      setCurrentVisitorIndex(currentVisitorIndex - 1);
    }
  };
  
  // Navigate to next visitor badge
  const showNextBadge = () => {
    if (currentVisitorIndex < allVisitorsToDisplay.length - 1) {
      setCurrentVisitorIndex(currentVisitorIndex + 1);
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
  
  return (
    <div className="p-4 flex flex-col gap-4 print:p-0">
      {/* UI controls - only visible on screen */}
      <div className="print:hidden">
        <HomeButton />
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Besucherausweis Druckvorschau
            {allVisitorsToDisplay.length > 1 && (
              <span className="ml-2 text-sm text-muted-foreground">
                ({currentVisitorIndex + 1} von {allVisitorsToDisplay.length})
              </span>
            )}
          </h2>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleManualPrint}
              variant="outline"
              className="flex items-center gap-2"
              disabled={printInitiatedRef.current}
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
          <h2 className="text-lg font-medium mb-2">
            Druckvorschau (A6-Format)
            {allVisitorsToDisplay.length > 1 && (
              <span className="ml-2 text-sm text-muted-foreground">
                - Ausweis {currentVisitorIndex + 1} von {allVisitorsToDisplay.length}
              </span>
            )}
          </h2>
          
          {/* Badge preview navigation buttons */}
          {allVisitorsToDisplay.length > 1 && (
            <div className="flex justify-center items-center gap-2 mb-4">
              <Button
                onClick={showPreviousBadge}
                variant="outline"
                size="sm"
                disabled={currentVisitorIndex <= 0}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Vorheriger
              </Button>
              
              <span className="text-sm">
                {currentVisitorIndex + 1} / {allVisitorsToDisplay.length}
              </span>
              
              <Button
                onClick={showNextBadge}
                variant="outline"
                size="sm"
                disabled={currentVisitorIndex >= allVisitorsToDisplay.length - 1}
                className="flex items-center"
              >
                Nächster
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
          
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
              height: '72mm',
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
                  visitor={currentVisitor.isMain ? visitor : {
                    ...visitor,
                    name: currentVisitor.name,
                    firstName: currentVisitor.firstName,
                    visitorNumber: currentVisitor.visitorNumber
                  }}
                  name={!currentVisitor.isMain ? currentVisitor.name : undefined}
                  firstName={!currentVisitor.isMain ? currentVisitor.firstName : undefined}
                  visitorNumber={!currentVisitor.isMain ? currentVisitor.visitorNumber : undefined}
                  printTimestamp={printTimestamp}
                  qrPosition={badgeLayout.qrCodePosition || 'right'}
                  className="w-full h-full"
                />
              </div>
            </div>
            
            {/* Middle divider - only visible in preview */}
            <div style={{
              position: 'absolute',
              top: '70mm',
              left: '0',
              height: '0',
              width: '100%',  
              borderTop: '1px dashed #ccc'
            }}></div>
            
            {/* Bottom badge preview */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '0',
              width: '100%',
              height: '72mm',
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
                  visitor={currentVisitor.isMain ? visitor : {
                    ...visitor,
                    name: currentVisitor.name,
                    firstName: currentVisitor.firstName,
                    visitorNumber: currentVisitor.visitorNumber
                  }}
                  name={!currentVisitor.isMain ? currentVisitor.name : undefined}
                  firstName={!currentVisitor.isMain ? currentVisitor.firstName : undefined}
                  visitorNumber={!currentVisitor.isMain ? currentVisitor.visitorNumber : undefined}
                  printTimestamp={printTimestamp}
                  qrPosition={badgeLayout.qrCodePosition || 'right'}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional visitors thumbnails section */}
        {hasAdditionalVisitors && (
          <div className="mt-8 mb-4">
            <h2 className="text-lg font-medium mb-4">Alle Besucherausweise</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allVisitorsToDisplay.map((visitorItem, index) => (
                <div 
                  key={`thumb-${index}`}
                  className={`cursor-pointer border rounded-md p-3 ${currentVisitorIndex === index ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => setCurrentVisitorIndex(index)}
                >
                  <div className="text-sm font-medium mb-1">
                    {visitorItem.isMain ? visitor.name : visitorItem.name}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    #{visitorItem.isMain ? visitor.visitorNumber : visitorItem.visitorNumber}
                  </div>
                  <div className="flex justify-center">
                    <div className="transform scale-50 origin-top">
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
                        className="transform scale-50"
                      />
                    </div>
                  </div>
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
