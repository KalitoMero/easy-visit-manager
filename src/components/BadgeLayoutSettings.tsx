
import React from 'react';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Layout, Type, QrCode, ArrowDownWideNarrow, AlignRight, AlignCenter } from "lucide-react";
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface BadgeLayoutSettingsProps {
  className?: string;
}

const BadgeLayoutSettings: React.FC<BadgeLayoutSettingsProps> = ({ className }) => {
  const {
    badgeLayout,
    setBadgeLayout,
    bottomMargin,
    setBottomMargin
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
  
  // Handle QR code position changes
  const handleQRCodePositionChange = (value: string) => {
    setBadgeLayout({ qrCodePosition: value as 'right' | 'center' });
  };

  // Handle bottom margin changes
  const handleBottomMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 20) {
      setBottomMargin(value);
    }
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
      footerSpacing: 8,
      qrCodePosition: 'right'
    });
    setBottomMargin(0);
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
                <div className="col-span-2">
                  <Select 
                    value={badgeLayout.fontSizeTitle} 
                    onValueChange={(value) => handleFontSizeChange(value, 'title')}
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
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Label htmlFor="name-font-size" className="self-center">Name</Label>
                <div className="col-span-2">
                  <Select 
                    value={badgeLayout.fontSizeName} 
                    onValueChange={(value) => handleFontSizeChange(value, 'name')}
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
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Label htmlFor="company-font-size" className="self-center">Firma</Label>
                <div className="col-span-2">
                  <Select 
                    value={badgeLayout.fontSizeCompany} 
                    onValueChange={(value) => handleFontSizeChange(value, 'company')}
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
          </div>
          
          {/* QR Code Position Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Layout className="h-4 w-4" /> QR-Code-Position
            </h4>
            
            <div className="space-y-2">
              <Select
                value={badgeLayout.qrCodePosition || 'right'}
                onValueChange={handleQRCodePositionChange}
              >
                <SelectTrigger id="qr-position">
                  <SelectValue placeholder="Position wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="right" className="flex items-center">
                    <div className="flex items-center">
                      <AlignRight className="mr-2 h-4 w-4" /> Rechts (Standard)
                    </div>
                  </SelectItem>
                  <SelectItem value="center" className="flex items-center">
                    <div className="flex items-center">
                      <AlignCenter className="mr-2 h-4 w-4" /> Zentriert unter dem Namen
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Positioniert den QR-Code entweder rechts neben dem Namen oder zentriert darunter
              </p>
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
              <ArrowDownWideNarrow className="h-4 w-4" /> Fußzeilen-Abstand
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

          {/* Bottom Margin */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <ArrowDownWideNarrow className="h-4 w-4" /> Unterer Rand
            </h4>
            
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Label htmlFor="bottom-margin" className="self-center">Unterer Rand (mm)</Label>
                <div className="col-span-2">
                  <Input
                    id="bottom-margin"
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={bottomMargin}
                    onChange={handleBottomMarginChange}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Zusätzlicher Abstand am unteren Seitenrand (0-20 mm)
              </p>
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
