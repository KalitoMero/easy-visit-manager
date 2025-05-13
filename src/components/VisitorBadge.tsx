
import React, { useEffect, useState } from 'react';
import { Visitor } from '@/hooks/useVisitorStore';
import { generateCheckoutEmailUrl, generateQRCodeDataUrl } from '@/lib/qrCodeUtils';
import { QrCode, Mail, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

interface VisitorBadgeProps {
  visitor: Visitor;
  name?: string; // Optional name for group visitors
  visitorNumber?: number; // Optional visitor number override for additional visitors
  className?: string; // Optional className for styling
  printTimestamp?: Date; // Optional timestamp for when the badge was printed
}

const VisitorBadge = ({ 
  visitor, 
  name, 
  visitorNumber, 
  className = '',
  printTimestamp = new Date() // Default to current time if not provided
}: VisitorBadgeProps) => {
  // Use the provided name (for group visitors) or the primary visitor name
  const displayName = name || visitor.name;
  // Use the provided visitor number override or the primary visitor number
  const displayVisitorNumber = visitorNumber || visitor.visitorNumber;
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Generate the checkout email URL directly with the correct visitor number
  const checkoutEmailUrl = generateCheckoutEmailUrl(displayVisitorNumber);
  
  // Format the current date and time in Central European Time
  const formattedDate = formatInTimeZone(printTimestamp, 'Europe/Berlin', 'dd.MM.yyyy');
  const formattedTime = formatInTimeZone(printTimestamp, 'Europe/Berlin', 'HH:mm');
  
  // Load the QR code immediately to ensure it's ready for printing
  useEffect(() => {
    const loadQrCode = async () => {
      setIsLoading(true);
      try {
        // Verwenden Sie eine kleinere QR-Code-Größe für A6-Format
        const dataUrl = await generateQRCodeDataUrl(checkoutEmailUrl, 120);
        setQrCodeUrl(dataUrl);
      } catch (error) {
        console.error("Failed to generate QR code:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQrCode();
  }, [checkoutEmailUrl]);

  return (
    <div className={`visitor-badge bg-white border border-gray-300 rounded-md p-5 flex flex-col justify-between ${className}`}>
      <div className="badge-header border-b pb-2">
        <div className="text-xl font-bold text-center">VISITOR</div>
      </div>
      
      <div className="badge-content flex-1 flex justify-between items-center py-3">
        <div className="visitor-info flex-1 flex flex-col justify-center items-center py-2 gap-2">
          <div className="visitor-number text-5xl font-bold text-primary mb-2">
            {displayVisitorNumber}
          </div>
          <div className="name text-2xl font-bold">
            {displayName}
          </div>
          <div className="company text-lg">
            {visitor.company}
          </div>
        </div>
        
        <div className="qr-code-container flex flex-col items-center justify-center p-3 ml-3 border border-gray-200 rounded-lg print:border-0">
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
                src={qrCodeUrl} 
                alt={`QR Code for visitor ${displayVisitorNumber}`} 
                className="w-24 h-24 object-contain"
              />
            </a>
          ) : (
            <div className="flex flex-col items-center justify-center w-24 h-24 bg-gray-100 rounded print:bg-transparent">
              <QrCode className="w-10 h-10 text-gray-400" />
              <div className="text-xs text-center mt-2 text-gray-500">
                QR code unavailable
              </div>
            </div>
          )}
          
          <div className="text-xs text-center mt-2 max-w-[140px]">
            <p className="font-bold">Scan to checkout</p>
            <p className="text-muted-foreground mt-1 text-[10px]">Opens email to: besucher@leuka.de</p>
          </div>
        </div>
      </div>
      
      <div className="badge-footer border-t pt-2">
        <div className="contact text-sm">
          Contact: <span className="font-medium">{visitor.contact}</span>
        </div>
        <div className="datetime flex items-center justify-between text-xs text-muted-foreground mt-1">
          <div className="date flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
          <div className="time flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formattedTime} Uhr</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorBadge;
