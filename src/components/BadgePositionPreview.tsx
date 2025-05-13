
import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import VisitorBadge from './VisitorBadge';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { Move, RotateCw } from 'lucide-react';

// Demo visitor data for the preview
const createDemoVisitor = () => ({
  id: 'demo-visitor',
  visitorNumber: 123,
  name: 'Max Mustermann',
  company: 'Musterfirma GmbH',
  contact: 'Empfang',
  checkInTime: new Date().toISOString(),
  checkOutTime: null,
  policyAccepted: true
});

const BadgePositionPreview = () => {
  const visitors = useVisitorStore(state => state.visitors);
  const previewTimestamp = new Date();
  
  // Get printer settings
  const { 
    badgeRotation, 
    badgeOffsetX, 
    badgeOffsetY, 
    setBadgeRotation, 
    setBadgeOffsetX, 
    setBadgeOffsetY 
  } = usePrinterSettings();
  
  // Use an actual visitor if available, otherwise use demo data
  const demoVisitor = visitors.length > 0 
    ? visitors[0] 
    : createDemoVisitor();
  
  // Create reference visitor data for the preview
  const [xInput, setXInput] = useState(badgeOffsetX.toString());
  const [yInput, setYInput] = useState(badgeOffsetY.toString());
  
  useEffect(() => {
    setXInput(badgeOffsetX.toString());
    setYInput(badgeOffsetY.toString());
  }, [badgeOffsetX, badgeOffsetY]);
  
  const handleXInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setXInput(e.target.value);
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setBadgeOffsetX(value);
    }
  };
  
  const handleYInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYInput(e.target.value);
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setBadgeOffsetY(value);
    }
  };
  
  const handleRotation = (rotation: 0 | 90 | 180 | 270) => {
    setBadgeRotation(rotation);
  };
  
  const handleReset = () => {
    setBadgeOffsetX(0);
    setBadgeOffsetY(0);
    setBadgeRotation(0);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Ausweisposition</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="x-offset">Horizontale Position (X)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="x-offset-input"
                      type="number"
                      value={xInput}
                      onChange={handleXInputChange}
                      className="w-20 text-right"
                      step={1}
                    />
                    <span className="text-sm text-muted-foreground">mm</span>
                  </div>
                </div>
                <Slider 
                  id="x-offset"
                  min={-50}
                  max={50}
                  step={1}
                  value={[badgeOffsetX]}
                  onValueChange={(values) => setBadgeOffsetX(values[0])}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Negative Werte verschieben nach links, positive nach rechts
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="y-offset">Vertikale Position (Y)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="y-offset-input"
                      type="number"
                      value={yInput}
                      onChange={handleYInputChange}
                      className="w-20 text-right"
                      step={1}
                    />
                    <span className="text-sm text-muted-foreground">mm</span>
                  </div>
                </div>
                <Slider 
                  id="y-offset"
                  min={-50}
                  max={50}
                  step={1}
                  value={[badgeOffsetY]}
                  onValueChange={(values) => setBadgeOffsetY(values[0])}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Negative Werte verschieben nach oben, positive nach unten
                </p>
              </div>
              
              <div>
                <Label className="block mb-2">Rotation</Label>
                <div className="flex flex-wrap gap-2">
                  {[0, 90, 180, 270].map((rotation) => (
                    <Button
                      key={rotation}
                      variant={badgeRotation === rotation ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => handleRotation(rotation as 0 | 90 | 180 | 270)}
                    >
                      <RotateCw 
                        className="mr-2 h-4 w-4" 
                        style={{ transform: `rotate(${rotation}deg)` }} 
                      />
                      {rotation}°
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button 
                variant="secondary" 
                className="w-full mt-4"
                onClick={handleReset}
              >
                <Move className="mr-2 h-4 w-4" />
                Zurücksetzen
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="flex-1">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Vorschau</h3>
            
            <div className="relative border border-dashed border-gray-300 p-4 h-[500px] flex items-center justify-center overflow-hidden bg-gray-50">
              {/* Badge preview */}
              <div 
                className="absolute" 
                style={{
                  transform: `translate(${badgeOffsetX}mm, ${badgeOffsetY}mm) rotate(${badgeRotation}deg)`,
                  transition: 'transform 0.2s ease-in-out',
                }}
              >
                <VisitorBadge visitor={demoVisitor} printTimestamp={previewTimestamp} />
              </div>
              
              {/* Center reference point */}
              <div className="absolute pointer-events-none w-1 h-1 bg-red-500 rounded-full">
                <div className="absolute w-10 h-10 border border-red-500 rounded-full -top-5 -left-5" />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Der rote Punkt zeigt die Mitte des A6-Blattes an. Der Ausweis wird relativ zu dieser Position platziert.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BadgePositionPreview;
