
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
  
  // Find the visitor
  const visitor = visitors.find(v => v.id === id);
  const hasAdditionalVisitors = visitor?.additionalVisitors && visitor.additionalVisitors.length > 0;

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
        }
        
        /* Ensure both badges are visible and correctly positioned */
        .visitor-badge-page {
          position: relative !important;
          width: 105mm !important;
          height: 148mm !important;
          page-break-after: always !important;
        }
        
        /* Position the first badge at the top */
        .visitor-badge-top {
          position: absolute !important;
          top: 5mm !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: 60mm !important;
          height: 60mm !important;
        }
        
        /* Position the second badge at the bottom */
        .visitor-badge-bottom {
          position: absolute !important;
          top: 78mm !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: 60mm !important;
          height: 60mm !important;
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
  
  // Handle automatic printing - immediately trigger printing on load
  useEffect(() => {
    // Skip if already triggered
    if (autoPrintTriggered.current || !visitor) return;
    
    // If automaticPrinting is enabled, or this is a direct print request
    if (enableAutomaticPrinting || isDirect) {
      autoPrintTriggered.current = true;
      
      logDebug('Print', "Starting automatic print process");
      
      try {
        if (isElectron()) {
          window.electronAPI.printBadge({
            id: visitor.id,
            name: visitor.name,
          }).then(() => {
            setPrintingCompleted(true);
          }).catch(() => {
            setPrintingCompleted(true);
          });
        } else {
          // Directly print without delay
          window.print();
          setPrintingCompleted(true);
        }
      } catch (error) {
        console.error("Print error:", error);
        setPrintingCompleted(true);
      }
    }
  }, [visitor, enableAutomaticPrinting, isDirect]);
  
  // Redirect after printing is completed
  useEffect(() => {
    if (printingCompleted && visitor) {
      logDebug('Print', "Redirecting after printing");
      
      // If this was opened directly, close the window instead of navigating
      if (isDirect) {
        window.close();
      } else {
        navigate(`/checkin/step3/${visitor.id}`);
      }
    }
  }, [printingCompleted, visitor, navigate, isDirect]);
  
  // Handle manual print
  const handleManualPrint = () => {
    if (autoPrintTriggered.current) {
      logDebug('Print', "Print already triggered, ignoring request");
      return;
    }
    
    toast({
      title: "Druckvorgang gestartet",
      description: "Das Druckfenster wird geöffnet...",
    });
    
    autoPrintTriggered.current = true;
    window.print();
    setPrintingCompleted(true);
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
            <Button 
              onClick={handleManualPrint}
              variant="outline"
              className="flex items-center gap-2"
              disabled={autoPrintTriggered.current}
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
      
      {/* Badge containers for printing - hidden on screen, visible when printing */}
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
