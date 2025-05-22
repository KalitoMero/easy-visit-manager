
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';

const PrinterPreviewSettings = () => {
  const { 
    skipPrintPreview, 
    setSkipPrintPreview,
    enableAutomaticPrinting,
    setEnableAutomaticPrinting
  } = usePrinterSettings();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Druckvorschau Einstellungen</CardTitle>
        <CardDescription>
          Konfigurieren Sie, wie der Druckvorgang ablaufen soll.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-print" className="font-medium">
              Automatisches Drucken
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Nach dem Unterschreiben automatisch drucken.
            </p>
          </div>
          <Switch
            id="auto-print"
            checked={enableAutomaticPrinting}
            onCheckedChange={setEnableAutomaticPrinting}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="skip-preview" className="font-medium">
              Druckvorschau überspringen
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Aktivieren Sie diese Option, um die Druckvorschau zu überspringen und direkt nach der Unterschrift zu drucken und zur Erfolgsseite zu navigieren.
            </p>
          </div>
          <Switch
            id="skip-preview"
            checked={skipPrintPreview}
            onCheckedChange={setSkipPrintPreview}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PrinterPreviewSettings;
