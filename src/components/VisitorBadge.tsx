
import React, { useEffect, useState, useRef } from 'react';
import { Visitor } from '@/hooks/useVisitorStore';
import { generateCheckoutEmailUrl, generateQRCodeDataUrl } from '@/lib/qrCodeUtils';
import { QrCode, Mail, Calendar, Clock } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';

interface VisitorBadgeProps {
  visitor: Visitor;
  name?: string; // Optional name for group visitors
  visitorNumber?: number; // Optional visitor number override for additional visitors
  className?: string; // Optional className for styling
  printTimestamp?: Date; // Optional timestamp for when the badge was printed
  qrPosition?: 'right' | 'center'; // QR code position option
  onQRCodeLoaded?: () => void; // Callback when QR code is loaded
}

const VisitorBadge = ({ 
  visitor, 
  name, 
  visitorNumber, 
  className = '',
  printTimestamp = new Date(), // Default to current time if not provided
  qrPosition = 'right', // Default to right-aligned QR code
  onQRCodeLoaded
}: VisitorBadgeProps) => {
  // Use the provided name (for group visitors) or the primary visitor name
  const displayName = name || visitor.name;
  // Use the provided visitor number override or the primary visitor number
  const displayVisitorNumber = visitorNumber || visitor.visitorNumber;
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeLoaded, setQrCodeLoaded] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const qrImgRef = useRef<HTMLImageElement>(null);
  
  // Get badge layout settings
  const badgeLayout = usePrinterSettings(state => state.badgeLayout);
  
  // Generate the checkout email URL directly with the correct visitor number
  const checkoutEmailUrl = generateCheckoutEmailUrl(displayVisitorNumber);
  
  // Format the current date and time in Central European Time
  const formattedDate = formatInTimeZone(printTimestamp, 'Europe/Berlin', 'dd.MM.yyyy');
  const formattedTime = formatInTimeZone(printTimestamp, 'Europe/Berlin', 'HH:mm');
  
  // Load the QR code immediately to ensure it's ready for printing
  useEffect(() => {
    let isMounted = true;
    
    const loadQrCode = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      try {
        console.log(`Loading QR code for visitor ${displayVisitorNumber}, attempt ${loadAttempt + 1}`);
        const dataUrl = await generateQRCodeDataUrl(checkoutEmailUrl, badgeLayout.qrCodeSize);
        if (isMounted) {
          if (dataUrl) {
            console.log(`QR code loaded successfully for visitor ${displayVisitorNumber}`);
            setQrCodeUrl(dataUrl);
            setIsLoading(false);
          } else {
            console.error(`Failed to generate QR code for visitor ${displayVisitorNumber}`);
            
            // If loading fails and we haven't exceeded max attempts, try again
            if (loadAttempt < 5) { // Increased max attempts
              setTimeout(() => {
                if (isMounted) {
                  setLoadAttempt(prev => prev + 1);
                }
              }, 500);
            } else {
              setIsLoading(false);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to generate QR code for visitor ${displayVisitorNumber}:`, error);
        setIsLoading(false);
        
        // Retry on error
        if (loadAttempt < 5) { // Increased max attempts
          setTimeout(() => {
            if (isMounted) {
              setLoadAttempt(prev => prev + 1);
            }
          }, 800);
        }
      }
    };
    
    loadQrCode();
    
    return () => {
      isMounted = false;
    };
  }, [checkoutEmailUrl, badgeLayout.qrCodeSize, displayVisitorNumber, loadAttempt]);

  // Handle QR code image load event
  const handleQrCodeLoaded = () => {
    console.log(`QR code for visitor ${displayVisitorNumber} loaded successfully`);
    setQrCodeLoaded(true);
    if (onQRCodeLoaded) {
      onQRCodeLoaded();
    }
  };

  // Font size utility function
  const getFontSize = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small': 
        return 'text-sm';
      case 'medium': 
        return 'text-base';
      case 'large': 
        return 'text-lg';
      default: 
        return 'text-base';
    }
  };

  // Title font size class
  const titleFontClass = (() => {
    switch (badgeLayout.fontSizeTitle) {
      case 'small': return 'text-lg';
      case 'medium': return 'text-xl';
      case 'large': return 'text-2xl';
      default: return 'text-xl';
    }
  })();

  // Name font size class
  const nameFontClass = (() => {
    switch (badgeLayout.fontSizeName) {
      case 'small': return 'text-xl';
      case 'medium': return 'text-2xl';
      case 'large': return 'text-3xl';
      default: return 'text-2xl';
    }
  })();

  // Company font size class
  const companyFontClass = (() => {
    switch (badgeLayout.fontSizeCompany) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  })();

  return (
    <div className={cn(
      "visitor-badge bg-white border border-gray-300 rounded-md p-2 flex flex-col box-border",
      "print:shadow-none print:border-0",
      "print:w-[60mm] print:h-[90mm]", // Exact dimensions for printing: 6cm x 9cm
      "w-full h-full", // Full width/height for screen display
      "print:p-1", // Reduce padding when printing
      className
    )}>
      {/* Badge Header - Reduced padding */}
      <div className="badge-header border-b pb-1 pt-0 text-center">
        <div className={`font-bold ${titleFontClass}`}>VISITOR</div>
      </div>
      
      {/* Badge Content - Main area with visitor info and QR code */}
      <div className={cn(
        "badge-content flex-1 py-1", // Reduced vertical padding
        qrPosition === 'center' ? "flex flex-col items-center" : "flex justify-between items-center"
      )}>
        {/* Left column - Visitor information */}
        <div className={cn(
          "visitor-info flex flex-col justify-center py-1 gap-1", // Reduced gap and padding
          qrPosition === 'center' ? "mb-2 w-full items-center" : "flex-1 items-center"
        )}>
          <div className="visitor-number text-5xl font-bold text-primary mb-1">
            {displayVisitorNumber}
          </div>
          <div className="salutation text-sm text-muted-foreground">
            Herr / Frau / Div
          </div>
          <div className={`name font-bold ${nameFontClass} truncate max-w-full text-center`}>
            {displayName}
          </div>
          <div className={`company ${companyFontClass} truncate max-w-full text-center`}>
            {visitor.company}
          </div>
        </div>
        
        {/* QR code section */}
        <div className={cn(
          "qr-code-section flex flex-col items-center",
          qrPosition === 'center' ? "w-full" : "ml-2" // Reduced margin
        )}>
          <div className="qr-code-container flex items-center justify-center p-1 border border-gray-200 rounded-lg print:border-0 bg-white">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center w-24 h-24 bg-gray-100 rounded animate-pulse print:hidden">
                <QrCode className="w-10 h-10 text-gray-300" />
              </div>
            ) : qrCodeUrl ? (
              <a 
                href={checkoutEmailUrl} 
                className="flex flex-col items-center"
                title="Scan to open email for checkout"
              >
                <img 
                  ref={qrImgRef}
                  src={qrCodeUrl} 
                  alt={`QR Code for visitor ${displayVisitorNumber}`} 
                  className="object-contain"
                  style={{ width: `${badgeLayout.qrCodeSize}px`, height: `${badgeLayout.qrCodeSize}px` }}
                  onLoad={handleQrCodeLoaded}
                />
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center w-24 h-24 bg-gray-100 rounded print:bg-transparent">
                <QrCode className="w-10 h-10 text-gray-400" />
                <div className="text-xs text-center mt-1 text-gray-500">
                  QR code unavailable
                </div>
              </div>
            )}
          </div>
          
          <div className="text-xs text-center mt-1"> {/* Reduced margin */}
            <p className="font-bold">Scan to checkout</p>
          </div>
        </div>
      </div>
      
      {/* Badge Footer */}
      <div className="badge-footer border-t pt-1 mt-auto"> {/* Reduced top padding */}
        {/* Contact Information - always display with enough space */}
        {badgeLayout.showContact && (
          <div className="contact text-sm truncate w-full">
            Contact: <span className="font-medium">{visitor.contact}</span>
          </div>
        )}
        
        {/* Date and Time - Improved to prevent truncation */}
        {badgeLayout.showDateTime && (
          <div className="datetime flex items-center justify-between text-xs text-muted-foreground">
            <div className="date flex items-center gap-1 whitespace-nowrap">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            <div className="time flex items-center gap-1 whitespace-nowrap">
              <Clock className="w-3 h-3" />
              <span>{formattedTime} Uhr</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorBadge;
