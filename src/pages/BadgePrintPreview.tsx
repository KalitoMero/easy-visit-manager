
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import VisitorBadge from '@/components/VisitorBadge';
import { toast } from "@/hooks/use-toast";

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
    printCopies
  } = usePrinterSettings();
  const printAttemptedRef = useRef(false);
  const printTimestamp = useRef(new Date()).current;
  
  // Find the primary visitor
  const visitor = visitors.find(v => v.id === id);
  
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
              printerName: selectedPrinterName
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
  }, [visitor, enableAutomaticPrinting, printWithoutDialog, printDelay, selectedPrinterName, printCopies]);
  
  if (!visitor) {
    return <div className="p-8 text-center">Visitor not found</div>;
  }
  
  // Für Gruppenbesucher, erstelle einen Ausweis für jeden Besucher
  const hasAdditionalVisitors = visitor.additionalVisitors && visitor.additionalVisitors.length > 0;
  
  return (
    <div className="p-4 flex flex-col gap-4 print:p-0">
      {/* Visitor badge container for A6 page */}
      <div className="visitor-badge-container print:block hidden">
        {/* Top badge - normal orientation */}
        <VisitorBadge 
          visitor={visitor} 
          className="visitor-badge visitor-badge-top" 
          printTimestamp={printTimestamp}
        />
        
        {/* Fold line */}
        <div className="fold-line"></div>
        
        {/* Bottom badge - rotated 90° */}
        <VisitorBadge 
          visitor={visitor} 
          className="visitor-badge visitor-badge-bottom" 
          printTimestamp={printTimestamp}
        />
      </div>
      
      {/* Screen preview (not for printing) - shows only regular badges */}
      <div className="print:hidden">
        {/* Primary visitor badge */}
        <div className="mb-4">
          <VisitorBadge 
            visitor={visitor} 
            printTimestamp={printTimestamp}
          />
        </div>
        
        {/* Additional visitor badges */}
        {hasAdditionalVisitors && visitor.additionalVisitors?.map((additionalVisitor) => (
          <div key={additionalVisitor.id} className="mb-4">
            <VisitorBadge 
              visitor={visitor} 
              name={additionalVisitor.name}
              visitorNumber={additionalVisitor.visitorNumber}
              printTimestamp={printTimestamp}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgePrintPreview;
