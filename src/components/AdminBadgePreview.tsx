import React, { useState, useRef } from 'react';
import VisitorBadge from './VisitorBadge';
import { Button } from './ui/button';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { Visitor } from '@/hooks/useVisitorStore';
import { Printer, Eye, Square, FoldHorizontal } from 'lucide-react';
import { AspectRatio } from './ui/aspect-ratio';

interface AdminBadgePreviewProps {
  visitor?: Visitor;
}

const AdminBadgePreview: React.FC<AdminBadgePreviewProps> = ({ visitor }) => {
  const [showPreview, setShowPreview] = useState(false);
  const visitors = useVisitorStore(state => state.visitors);
  const previewTimestamp = useRef(new Date()).current;
  
  // Wenn kein Besucher übergeben wurde, nehmen wir den ersten aktiven Besucher
  // oder erstellen einen Beispielbesucher für die Vorschau
  const demoVisitor: Visitor = visitor || visitors.find(v => !v.checkOutTime) || {
    id: 'demo-visitor',
    visitorNumber: 123,
    name: 'Max Mustermann',
    company: 'Musterfirma GmbH',
    contact: 'Empfang',
    checkInTime: new Date().toISOString(),
    checkOutTime: null,
    policyAccepted: true,
    additionalVisitorCount: 0
  };
  
  const handlePrint = () => {
    // Öffnet einen neuen Tab mit der Druckvorschau
    if (visitor) {
      const printWindow = window.open(`/print-badge/${visitor.id}`, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        });
      }
    } else {
      // Falls kein spezifischer Besucher ausgewählt wurde, nur eine Beispielvorschau anzeigen
      alert('Bitte wählen Sie einen Besucher zum Drucken aus.');
    }
  };
  
  return (
    <div className="mt-4 p-4 border rounded-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">A6-Besucherausweis Vorschau</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowPreview(!showPreview)}
            className="flex gap-2 items-center"
          >
            <Eye size={16} />
            {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
          </Button>
          
          {visitor && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handlePrint}
              className="flex gap-2 items-center"
            >
              <Printer size={16} />
              Drucken
            </Button>
          )}
        </div>
      </div>
      
      {showPreview && (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
            <Square size={16} />
            <span>A6-Format: 105 × 148 mm</span>
            <FoldHorizontal size={16} />
            <span>Mittellinie zum Falten</span>
          </div>
          
          <div className="badge-preview-container">
            {/* Top badge */}
            <VisitorBadge 
              visitor={demoVisitor} 
              className="visitor-badge visitor-badge-top" 
              printTimestamp={previewTimestamp}
            />
            
            {/* Fold line */}
            <div className="badge-fold-line"></div>
            
            <div className="visitor-badge-bottom-preview" style={{ position: 'relative', width: '100%' }}>
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%) rotate(90deg)',
                width: '74mm', 
                height: '105mm' 
              }}>
                <VisitorBadge 
                  visitor={demoVisitor} 
                  className="visitor-badge" 
                  printTimestamp={previewTimestamp}
                />
              </div>
            </div>
          </div>
          
          <p className="mt-4 text-sm text-gray-500 text-center">
            Der Besucherausweis wird auf A6-Papier gedruckt. <br />
            Er enthält zwei identische Ausweise: oben normal, unten um 90° gedreht für beidseitige Lesbarkeit nach dem Falten.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminBadgePreview;
