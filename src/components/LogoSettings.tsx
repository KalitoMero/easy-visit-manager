
import React, { useState } from 'react';
import ImageUploader from './ImageUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import { Trash2 } from 'lucide-react';

const LogoSettings = () => {
  const { companyLogo, showBuiltByText, setCompanyLogo, setShowBuiltByText } = usePrinterSettings();
  const [showPreview, setShowPreview] = useState(false);

  const handleLogoUpload = (base64Logo: string) => {
    setCompanyLogo(base64Logo);
  };

  const handleRemoveLogo = () => {
    setCompanyLogo(null);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Logo Einstellungen</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="company-logo">Firmenlogo</Label>
          <ImageUploader 
            onImageSelect={handleLogoUpload} 
            currentImage={companyLogo} 
          />
          {companyLogo && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={handleRemoveLogo}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Logo entfernen
            </Button>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            Das Logo wird auf der Startseite rechts unten angezeigt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Switch 
            id="show-built-by"
            checked={showBuiltByText}
            onCheckedChange={setShowBuiltByText}
          />
          <Label htmlFor="show-built-by">Text "Built by" anzeigen</Label>
        </div>

        {companyLogo && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-2">Vorschau:</div>
            <div className="border rounded p-4 flex items-center gap-2">
              {showBuiltByText && <span className="text-sm text-muted-foreground">Built by</span>}
              <img 
                src={companyLogo} 
                alt="Company Logo" 
                className="max-h-8 max-w-32 object-contain"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogoSettings;
