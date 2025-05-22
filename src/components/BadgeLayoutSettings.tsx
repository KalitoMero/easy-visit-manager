
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import VisitorBadge from '@/components/VisitorBadge';
import { useToast } from "@/hooks/use-toast";
import HomeButton from "@/components/HomeButton";
import { Button } from '@/components/ui/button';
import { Printer, QrCode } from 'lucide-react';
import { logDebug } from '@/lib/debugUtils';
import { isElectron, printVisitorBadge, createPrintController } from '@/lib/htmlBadgePrinter';

// Storage key for tracking recent print operations
const PRINT_HISTORY_KEY = 'visitor-print-history';

const BadgePrintPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const visitors = useVisitorStore(state => state.visitors);
  const { toast } = useToast();
  
  // Check if we should print immediately (direct mode)
  const isDirect = searchParams.get('direct') === 'true';
  
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
  const printTimestamp = useRef(new Date()).current;
  const autoPrintTriggered = useRef(false);
  const [printingCompleted, setPrintingCompleted] = useState(false);
  const [currentPrintIndex, setCurrentPrintIndex] = useState(0);
  const printController = useRef(createPrintController()).current;
  
  // Find the visitor
  const visitor = visitors.find(v => v.id === id);
  
  // Create a flattened array of visitors (main + additional)
  const allVisitors = useRef<Array<{
    visitor: typeof visitor, 
    name?: string,
    firstName?: string,
    visitorNumber: number
  }>>([]).current;
  
  // Prepare all visitors to be printed - ONCE
  useEffect(() => {
    if (visitor && allVisitors.length === 0) {
      // Add main visitor
      allVisitors.push({
        visitor: visitor,
        visitorNumber: visitor.visitorNumber
      });
      
      // Add additional visitors if any
      if (visitor.additionalVisitors && visitor.additionalVisitors.length > 0) {
        visitor.additionalVisitors.forEach(additionalVisitor => {
          allVisitors.push({
            visitor: visitor,
            name: additionalVisitor.name,
            firstName: additionalVisitor.firstName,
            visitorNumber: additionalVisitor.visitorNumber
          });
        });
      }
      
      logDebug('Print', `Prepared ${allVisitors.length} visitors for printing`);
    }
  }, [visitor, allVisitors]);
  
  // Record this visitor as printed
  const recordPrint = () => {
    if (!id) return;
    
    try {
      const printHistory = JSON.parse(localStorage.getItem(PRINT_HISTORY_KEY) || '{}');
      printHistory[id] = Date.now();
      localStorage.setItem(PRINT_HISTORY_KEY, JSON.stringify(printHistory));
    } catch (e) {
      // Ignore storage errors
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
  }, [bottomMargin]);
  
  // Handle printing process for single or multiple badges
  const handlePrintProcess = async () => {
    if (!visitor) return;
    
    // If print has already been attempted, prevent repeated prints
    if (!printController.print()) {
      logDebug('Print', 'Print controller blocked print attempt');
      return;
    }
    
    try {
      // Print the current badge
      await printVisitorBadge();
      
      // Update print index
      const nextIndex = currentPrintIndex + 1;
      setCurrentPrintIndex(nextIndex);
      
      // Reset controller for next print
      printController.reset();
      
      // If we have more badges to print, continue printing
      if (nextIndex < allVisitors.length) {
        // Continue with next badge after a brief delay
        setTimeout(() => {
          logDebug('Print', `Printing next badge (${nextIndex + 1} of ${allVisitors.length})`);
          // The component will re-render with the new currentPrintIndex
        }, 500);
      } else {
        // All badges printed, navigate back
        setPrintingCompleted(true);
        recordPrint();
        logDebug('Print', 'All badges printed successfully');
        
        // Navigate back with a short delay
        setTimeout(() => {
          if (isDirect) {
            window.close();
          } else {
            navigate(`/checkin/step3/${visitor.id}?fromPrint=true`);
          }
        }, 300);
      }
    } catch (error) {
      console.error('Print error:', error);
      printController.reset();
      setPrintingCompleted(true);
      
      // Navigate back even if there's an error
      setTimeout(() => {
        if (isDirect) {
          window.close();
        } else {
          navigate(`/checkin/step3/${visitor.id}?fromPrint=true`);
        }
      }, 300);
    }
  };
  
  // Safety navigation - used as a fallback if printing gets stuck
  const safeNavigateAfterPrint = () => {
    if (visitor && !printingCompleted) {
      setPrintingCompleted(true);
      recordPrint();
      
      if (isDirect) {
        window.close();
      } else {
        navigate(`/checkin/step3/${visitor.id}?fromPrint=true`);
      }
    }
  };
  
  // Force navigation after timeout as safety measure
  useEffect(() => {
    // Only start safety timer if in direct mode and not completed
    if (!isDirect || printingCompleted || !visitor) return;
    
    const forceNavigationTimer = setTimeout(() => {
      logDebug('Print', '⚠️ FORCE NAVIGATION: Safety timeout triggered');
      safeNavigateAfterPrint();
    }, 3000); // 3 second safety timeout
    
    return () => {
      clearTimeout(forceNavigationTimer);
    };
  }, [isDirect, printingCompleted, visitor]);
  
  // Handle automatic printing based on settings
  useEffect(() => {
    // Skip if already triggered, no visitor data, or printing completed
    if (autoPrintTriggered.current || !visitor || printingCompleted) return;
    
    // If direct mode is enabled or auto printing
    if (isDirect || enableAutomaticPrinting) {
      autoPrintTriggered.current = true;
      
      // Run automatic print with a small delay to ensure render is complete
      setTimeout(() => {
        logDebug('Print', "Starting automatic print process");
        handlePrintProcess();
      }, 300);
    }
  }, [visitor, enableAutomaticPrinting, isDirect, printingCompleted, currentPrintIndex]);
  
  // Handle manual print
  const handleManualPrint = () => {
    if (autoPrintTriggered.current || !visitor) return;
    
    toast({
      title: "Druckvorgang gestartet",
      description: "Das Druckfenster wird geöffnet...",
    });
    
    // Set status and start print process
    autoPrintTriggered.current = true;
    handlePrintProcess();
  };
  
  // Return to success page
  const handleReturn = () => {
    if (visitor) {
      navigate(`/checkin/step3/${visitor.id}?fromPrint=true`);
    } else {
      navigate('/');
    }
  };
  
  // Get current visitor being printed
  const getCurrentVisitorData = () => {
    if (!visitor || allVisitors.length === 0) return null;
    
    return allVisitors[currentPrintIndex] || allVisitors[0];
  };
  
  if (!visitor) {
    return (
      <div className="p-8 text-center">
        <HomeButton />
        <div className="mt-8">Visitor not found</div>
      </div>
    );
  }
  
  // Get current visitor for printing
  const currentVisitor = getCurrentVisitorData();
  
  return (
    <div className="p-4 flex flex-col gap-4 print:p-0">
      {/* UI controls - visible only on screen */}
      <div className="print:hidden">
        <HomeButton />
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Besucherausweis Druckvorschau
            {allVisitors.length > 1 && (
              <span className="ml-2 text-sm text-muted-foreground">
                (Ausweis {currentPrintIndex + 1} von {allVisitors.length})
              </span>
            )}
          </h2>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleManualPrint}
              variant="outline"
              className="flex items-center gap-2"
              disabled={autoPrintTriggered.current}
            >
              <Printer className="h-4 w-4" />
              Manuell drucken
            </Button>
            
            <Button 
              onClick={handleReturn}
              variant="ghost"
            >
              Zurück
            </Button>
          </div>
        </div>
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
            height: '90mm', /* 9cm */
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxSizing: 'border-box',
            overflow: 'hidden',
            padding: 0,
            margin: 0
          }}>
            {currentVisitor && (
              <div style={{
                transform: `translate(${badgeOffsetX}mm, ${badgeOffsetY}mm) rotate(${badgeRotation}deg)`,
                width: '60mm', /* 6cm */
                height: '90mm', /* 9cm */
                boxSizing: 'border-box'
              }}>
                <VisitorBadge 
                  visitor={currentVisitor.visitor} 
                  name={currentVisitor.name}
                  firstName={currentVisitor.firstName}
                  visitorNumber={currentVisitor.visitorNumber}
                  printTimestamp={printTimestamp}
                  qrPosition={badgeLayout.qrCodePosition || 'right'}
                  className="print-badge"
                />
              </div>
            )}
          </div>
          
          {/* Bottom badge - exactly 6cm × 9cm */}
          <div style={{
            position: 'absolute',
            top: '90mm', /* Position below the first badge */
            left: '0',
            width: '100%',
            height: '90mm', /* 9cm */
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxSizing: 'border-box',
            overflow: 'hidden',
            padding: 0,
            margin: 0
          }}>
            {currentVisitor && (
              <div style={{
                transform: `translate(${secondBadgeOffsetX}mm, ${secondBadgeOffsetY}mm) rotate(${secondBadgeRotation}deg)`,
                width: '60mm', /* 6cm */
                height: '90mm', /* 9cm */
                boxSizing: 'border-box'
              }}>
                <VisitorBadge 
                  visitor={currentVisitor.visitor} 
                  name={currentVisitor.name}
                  firstName={currentVisitor.firstName}
                  visitorNumber={currentVisitor.visitorNumber}
                  printTimestamp={printTimestamp}
                  qrPosition={badgeLayout.qrCodePosition || 'right'}
                  className="print-badge"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Screen preview - visible only on screen */}
      <div className="print:hidden">
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-2">
            Druckvorschau (A6-Format)
            {allVisitors.length > 1 && (
              <span className="ml-2 text-sm text-muted-foreground">
                - Badge {currentPrintIndex + 1} von {allVisitors.length}
              </span>
            )}
          </h2>
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
              {currentVisitor && (
                <div style={{
                  transform: `translate(${badgeOffsetX}mm, ${badgeOffsetY}mm) rotate(${badgeRotation}deg)`,
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease-in-out',
                  scale: '0.7',
                  width: '60mm',
                  height: '90mm',
                  boxSizing: 'border-box'
                }}>
                  <VisitorBadge 
                    visitor={currentVisitor.visitor} 
                    name={currentVisitor.name}
                    firstName={currentVisitor.firstName}
                    visitorNumber={currentVisitor.visitorNumber}
                    printTimestamp={printTimestamp}
                    qrPosition={badgeLayout.qrCodePosition || 'right'}
                    className="w-full h-full"
                  />
                </div>
              )}
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
              {currentVisitor && (
                <div style={{
                  transform: `translate(${secondBadgeOffsetX}mm, ${secondBadgeOffsetY}mm) rotate(${secondBadgeRotation}deg)`,
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease-in-out',
                  scale: '0.7',
                  width: '60mm',
                  height: '90mm',
                  boxSizing: 'border-box'
                }}>
                  <VisitorBadge 
                    visitor={currentVisitor.visitor} 
                    name={currentVisitor.name}
                    firstName={currentVisitor.firstName}
                    visitorNumber={currentVisitor.visitorNumber}
                    printTimestamp={printTimestamp}
                    qrPosition={badgeLayout.qrCodePosition || 'right'}
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Print navigation controls for multiple visitors */}
        {allVisitors.length > 1 && (
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {currentPrintIndex + 1} von {allVisitors.length} Ausweisen
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPrintIndex === 0}
                onClick={() => setCurrentPrintIndex(prev => Math.max(0, prev - 1))}
              >
                Vorheriger Ausweis
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPrintIndex >= allVisitors.length - 1}
                onClick={() => setCurrentPrintIndex(prev => Math.min(allVisitors.length - 1, prev + 1))}
              >
                Nächster Ausweis
              </Button>
            </div>
          </div>
        )}
        
        {/* All visitors preview (small thumbnails) */}
        {allVisitors.length > 1 && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Alle Besucher-Ausweise</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allVisitors.map((visitorData, index) => (
                <div 
                  key={index} 
                  className={`border p-2 rounded cursor-pointer ${currentPrintIndex === index ? 'border-primary' : 'border-gray-200'}`}
                  onClick={() => setCurrentPrintIndex(index)}
                >
                  <div className="text-sm font-medium mb-1">
                    {visitorData.name || visitor?.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    #{visitorData.visitorNumber}
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
