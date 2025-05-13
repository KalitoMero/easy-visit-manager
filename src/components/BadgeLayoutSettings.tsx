
import React from 'react';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Layout, Type, QrCode, Spacing } from "lucide-react";
import { cn } from '@/lib/utils';

interface BadgeLayoutSettingsProps {
  className?: string;
}

const BadgeLayoutSettings: React.FC<BadgeLayoutSettingsProps> = ({ className }) => {
  const {
    badgeLayout,
    setBadgeLayout
  } = usePrinterSettings();

  const fontSizeOptions = [
    { value: "small", label: "Klein" },
    { value: "medium", label: "Mittel" },
    { value: "large", label: "Groß" }
  ];

  // Handle showContact toggle
  const handleShowContactChange = (checked: boolean) => {
    setBadgeLayout({ showContact: checked });
  };

  // Handle showDateTime toggle
  const handleShowDateTimeChange = (checked: boolean) => {
    setBadgeLayout({ showDateTime: checked });
  };

  // Handle font size changes for different elements
  const handleFontSizeChange = (value: string, element: 'title' | 'name' | 'company') => {
    // Type assertion to match the expected 'small' | 'medium' | 'large' type
    const validValue = value as 'small' | 'medium' | 'large';
    
    if (element === 'title') {
      setBadgeLayout({ fontSizeTitle: validValue });
    } else if (element === 'name') {
      setBadgeLayout({ fontSizeName: validValue });
    } else if (element === 'company') {
      setBadgeLayout({ fontSizeCompany: validValue });
    }
  };

  // Handle QR code size changes
  const handleQRCodeSizeChange = (value: number[]) => {
    setBadgeLayout({ qrCodeSize: value[0] });
  };
  
  // Handle footer spacing changes
  const handleFooterSpacingChange = (value: number[]) => {
    setBadgeLayout({ footerSpacing: value[0] });
  };

  // Reset to default settings
  const handleResetDefaults = () => {
    setBadgeLayout({
      showContact: true,
      showDateTime: true,
      fontSizeTitle: 'medium',
      fontSizeName: 'medium',
      fontSizeCompany: 'medium',
      qrCodeSize: 120,
      footerSpacing: 8
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="text-lg font-semibold">Ausweis-Layout anpassen</h3>
      
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Field Visibility Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" /> Feld-Sichtbarkeit
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-contact"
                  checked={badgeLayout.showContact}
                  onCheckedChange={handleShowContactChange}
                />
                <Label htmlFor="show-contact">Kontaktperson anzeigen</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-date-time"
                  checked={badgeLayout.showDateTime}
                  onCheckedChange={handleShowDateTimeChange}
                />
                <Label htmlFor="show-date-time">Datum und Uhrzeit anzeigen</Label>
              </div>
            </div>
          </div>
          
          {/* Font Size Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4" /> Schriftgrößen
            </h4>
            
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Label htmlFor="title-font-size" className="self-center">Titel</Label>
                <Select 
                  value={badgeLayout.fontSizeTitle} 
                  onValueChange={(value) => handleFontSizeChange(value, 'title')}
                  className="col-span-2"
                >
                  <SelectTrigger id="title-font-size">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizeOptions.map((option) => (
                      <SelectItem key={`title-${option.value}`} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Label htmlFor="name-font-size" className="self-center">Name</Label>
                <Select 
                  value={badgeLayout.fontSizeName} 
                  onValueChange={(value) => handleFontSizeChange(value, 'name')}
                  className="col-span-2"
                >
                  <SelectTrigger id="name-font-size">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizeOptions.map((option) => (
                      <SelectItem key={`name-${option.value}`} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Label htmlFor="company-font-size" className="self-center">Firma</Label>
                <Select 
                  value={badgeLayout.fontSizeCompany} 
                  onValueChange={(value) => handleFontSizeChange(value, 'company')}
                  className="col-span-2"
                >
                  <SelectTrigger id="company-font-size">
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fontSizeOptions.map((option) => (
                      <SelectItem key={`company-${option.value}`} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* QR Code Size Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <QrCode className="h-4 w-4" /> QR-Code-Größe
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="qr-code-size">Größe ({badgeLayout.qrCodeSize}px)</Label>
              </div>
              <Slider 
                id="qr-code-size"
                value={[badgeLayout.qrCodeSize]} 
                min={80} 
                max={160}
                step={10}
                onValueChange={handleQRCodeSizeChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Klein</span>
                <span>Mittel</span>
                <span>Groß</span>
              </div>
            </div>
          </div>
          
          {/* Footer Spacing */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Spacing className="h-4 w-4" /> Fußzeilen-Abstand
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="footer-spacing">Abstand ({badgeLayout.footerSpacing}px)</Label>
              </div>
              <Slider 
                id="footer-spacing"
                value={[badgeLayout.footerSpacing]} 
                min={0} 
                max={20}
                step={1}
                onValueChange={handleFooterSpacingChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Kein Abstand</span>
                <span>Standard</span>
                <span>Großer Abstand</span>
              </div>
            </div>
          </div>
          
          {/* Reset Button */}
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={handleResetDefaults}
            >
              Standardwerte wiederherstellen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BadgeLayoutSettings;
