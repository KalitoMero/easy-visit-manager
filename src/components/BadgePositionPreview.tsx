import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import VisitorBadge from './VisitorBadge';
import { useVisitorStore, Visitor } from '@/hooks/useVisitorStore';
import { Move, RotateCw, CreditCard } from 'lucide-react';

// Demo visitor data for the preview
const createDemoVisitor = (): Visitor => ({
  id: 'demo-visitor',
  visitorNumber: 123,
  name: 'Max Mustermann',
  company: 'Musterfirma GmbH',
  contact: 'Empfang',
  checkInTime: new Date().toISOString(),
  checkOutTime: null,
  additionalVisitorCount: 0,
  policyAccepted: true
});

// Positionierungs-Controls für einen einzelnen Ausweis
const BadgePositionControls = ({ 
  rotation, 
  offsetX, 
  offsetY, 
  setRotation, 
  setOffsetX, 
  setOffsetY,
  label
}: { 
  rotation: number, 
  offsetX: number, 
  offsetY: number,
  setRotation: (value: number) => void,
  setOffsetX: (value: number) => void,
  setOffsetY: (value: number) => void,
  label: string
}) => {
  const [xInput, setXInput] = useState(offsetX.toString());
  const [yInput, setYInput] = useState(offsetY.toString());
  
  useEffect(() => {
    setXInput(offsetX.toString());
    setYInput(offsetY.toString());
  }, [offsetX, offsetY]);
  
  const handleXInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setXInput(e.target.value);
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setOffsetX(value);
    }
  };
  
  const handleYInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYInput(e.target.value);
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setOffsetY(value);
    }
  };
  
  return (
    <div className="space-y-6">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        {label}
      </h4>
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor={`x-offset-${label}`}>Horizontale Position (X)</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`x-offset-input-${label}`}
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
          id={`x-offset-${label}`}
          min={-50}
          max={50}
          step={1}
          value={[offsetX]}
          onValueChange={(values) => setOffsetX(values[0])}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Negative Werte verschieben nach links, positive nach rechts
        </p>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label htmlFor={`y-offset-${label}`}>Vertikale Position (Y)</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`y-offset-input-${label}`}
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
          id={`y-offset-${label}`}
          min={-50}
          max={50}
          step={1}
          value={[offsetY]}
          onValueChange={(values) => setOffsetY(values[0])}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Negative Werte verschieben nach oben, positive nach unten
        </p>
      </div>
      
      <div>
        <Label className="block mb-2">Rotation</Label>
        <div className="flex flex-wrap gap-2">
          {[0, 90, 180, 270].map((rot) => (
            <Button
              key={rot}
              variant={rotation === rot ? "default" : "outline"}
              className="flex-1"
              onClick={() => setRotation(rot as 0 | 90 | 180 | 270)}
            >
              <RotateCw 
                className="mr-2 h-4 w-4" 
                style={{ transform: `rotate(${rot}deg)` }} 
              />
              {rot}°
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

const BadgePositionPreview = () => {
  const visitors = useVisitorStore(state => state.visitors);
  const previewTimestamp = new Date();
  
  // Get printer settings
  const { 
    // Erster Ausweis
    badgeRotation, 
    badgeOffsetX, 
    badgeOffsetY, 
    setBadgeRotation, 
    setBadgeOffsetX, 
    setBadgeOffsetY,
    // Zweiter Ausweis 
    secondBadgeRotation, 
    secondBadgeOffsetX, 
    secondBadgeOffsetY, 
    setSecondBadgeRotation, 
    setSecondBadgeOffsetX, 
    setSecondBadgeOffsetY 
  } = usePrinterSettings();
  
  // Use an actual visitor if available, otherwise use demo data
  const demoVisitor = visitors.length > 0 
    ? visitors[0] 
    : createDemoVisitor();
  
  const handleReset = () => {
    // Erster Ausweis zurücksetzen
    setBadgeOffsetX(0);
    setBadgeOffsetY(0);
    setBadgeRotation(0);
    // Zweiter Ausweis zurücksetzen
    setSecondBadgeOffsetX(0);
    setSecondBadgeOffsetY(0);
    setSecondBadgeRotation(0);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Ausweispositionen</h3>
            
            <Tabs defaultValue="badge1" className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="badge1">Ausweis 1 (oben)</TabsTrigger>
                <TabsTrigger value="badge2">Ausweis 2 (unten)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="badge1">
                <BadgePositionControls 
                  rotation={badgeRotation}
                  offsetX={badgeOffsetX}
                  offsetY={badgeOffsetY}
                  setRotation={setBadgeRotation}
                  setOffsetX={setBadgeOffsetX}
                  setOffsetY={setBadgeOffsetY}
                  label="Oberer Ausweis"
                />
              </TabsContent>
              
              <TabsContent value="badge2">
                <BadgePositionControls 
                  rotation={secondBadgeRotation}
                  offsetX={secondBadgeOffsetX}
                  offsetY={secondBadgeOffsetY}
                  setRotation={setSecondBadgeRotation}
                  setOffsetX={setSecondBadgeOffsetX}
                  setOffsetY={setSecondBadgeOffsetY}
                  label="Unterer Ausweis"
                />
              </TabsContent>
            </Tabs>
            
            <Button 
              variant="secondary" 
              className="w-full mt-4"
              onClick={handleReset}
            >
              <Move className="mr-2 h-4 w-4" />
              Alle Positionen zurücksetzen
            </Button>
          </Card>
        </div>
        
        <div className="flex-1">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Vorschau</h3>
            
            <div className="relative border border-dashed border-gray-300 p-4 h-[600px] flex flex-col items-center justify-center overflow-hidden bg-gray-50">
              {/* A6 Paper Outline */}
              <div className="border border-gray-300 bg-white w-[105mm] h-[148mm] relative overflow-hidden">
                {/* Badge 1 preview - Oberer Ausweis */}
                <div 
                  className="absolute top-0 left-0 w-full h-1/2 flex items-center justify-center" 
                >
                  <div
                    style={{
                      transform: `translate(${badgeOffsetX}mm, ${badgeOffsetY}mm) rotate(${badgeRotation}deg)`,
                      transition: 'transform 0.2s ease-in-out',
                    }}
                  >
                    <VisitorBadge 
                      visitor={demoVisitor} 
                      printTimestamp={previewTimestamp}
                      className="scale-[0.7]" // Skaliere etwas kleiner für die Vorschau
                    />
                  </div>
                </div>
                
                {/* Divider line */}
                <div className="absolute top-1/2 left-0 w-full border-t border-gray-300 border-dashed"></div>
                
                {/* Badge 2 preview - Unterer Ausweis */}
                <div 
                  className="absolute top-1/2 left-0 w-full h-1/2 flex items-center justify-center" 
                >
                  <div
                    style={{
                      transform: `translate(${secondBadgeOffsetX}mm, ${secondBadgeOffsetY}mm) rotate(${secondBadgeRotation}deg)`,
                      transition: 'transform 0.2s ease-in-out',
                    }}
                  >
                    <VisitorBadge 
                      visitor={demoVisitor} 
                      printTimestamp={previewTimestamp}
                      className="scale-[0.7]" // Skaliere etwas kleiner für die Vorschau
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Vorschau des A6-Blattes mit zwei voneinander unabhängig positionierbaren Besucherausweisen.
              Die tatsächliche Größe beim Drucken kann etwas variieren.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BadgePositionPreview;
