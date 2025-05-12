
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import VisitorBadge from '@/components/VisitorBadge';

const BadgePrintPreview = () => {
  const { id } = useParams<{ id: string }>();
  const visitors = useVisitorStore(state => state.visitors);
  const { 
    enableAutomaticPrinting, 
    printWithoutDialog, 
    printDelay 
  } = usePrinterSettings();
  const printAttemptedRef = useRef(false);
  
  // Find the primary visitor
  const visitor = visitors.find(v => v.id === id);
  
  useEffect(() => {
    // Vermeidung mehrfacher Druckversuche
    if (visitor && !printAttemptedRef.current && enableAutomaticPrinting) {
      printAttemptedRef.current = true;
      
      // Prüfen auf Kiosk-Druck-Modus
      const isKioskPrintingSupported = 
        window.navigator.userAgent.includes('Chrome') || 
        window.navigator.userAgent.includes('Chromium');
      
      if (printWithoutDialog && isKioskPrintingSupported) {
        console.log('Kiosk-Druck wird initiiert...');
        // Der Browser könnte im Kiosk-Modus sein, versuche direkt zu drucken
        window.print();
      } else {
        // Fallback für den Fall, dass kein Kiosk-Modus aktiv ist
        // oder der Nutzer möchte den Druckdialog sehen
        console.log('Fallback-Druck mit Verzögerung wird initiiert...');
        const timer = setTimeout(() => {
          window.print();
        }, printDelay); // Konfigurierbare Verzögerung für das Rendering
        
        return () => clearTimeout(timer);
      }
    }
  }, [visitor, enableAutomaticPrinting, printWithoutDialog, printDelay]);
  
  if (!visitor) {
    return <div className="p-8 text-center">Visitor not found</div>;
  }
  
  // Für Gruppenbesucher, erstelle einen Ausweis für jeden Besucher
  const hasAdditionalVisitors = visitor.additionalVisitors && visitor.additionalVisitors.length > 0;
  
  return (
    <div className="p-4 flex flex-col gap-4 print:p-0">
      {/* Primary visitor badge */}
      <VisitorBadge visitor={visitor} />
      
      {/* Additional visitor badges */}
      {hasAdditionalVisitors && visitor.additionalVisitors?.map((additionalVisitor) => (
        <VisitorBadge 
          key={additionalVisitor.id}
          visitor={visitor} 
          name={additionalVisitor.name}
          visitorNumber={additionalVisitor.visitorNumber}
        />
      ))}
    </div>
  );
};

export default BadgePrintPreview;
