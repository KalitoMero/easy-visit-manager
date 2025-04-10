
import React, { useEffect, useState } from 'react';
import { Visitor } from '@/hooks/useVisitorStore';
import { generateCheckoutEmailUrl, generateQRCodeDataUrl } from '@/lib/qrCodeUtils';
import { QrCode, Mail } from 'lucide-react';

interface VisitorBadgeProps {
  visitor: Visitor;
  name?: string; // Optional name for group visitors
}

const VisitorBadge = ({ visitor, name }: VisitorBadgeProps) => {
  // Use the provided name (for group visitors) or the primary visitor name
  const displayName = name || visitor.name;
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Generate the checkout email URL directly
  const checkoutEmailUrl = generateCheckoutEmailUrl(visitor.visitorNumber);
  
  // Load the QR code
  useEffect(() => {
    const loadQrCode = async () => {
      setIsLoading(true);
      try {
        // Generate a smaller QR code (140px instead of 200px - 30% smaller)
        const dataUrl = await generateQRCodeDataUrl(checkoutEmailUrl, 140);
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
    <div className="visitor-badge bg-white border border-gray-300 rounded-md p-6 w-[148mm] h-[105mm] flex flex-col justify-between print:break-after-page">
      <div className="badge-header border-b pb-2">
        <div className="text-2xl font-bold text-center">VISITOR</div>
      </div>
      
      <div className="badge-content flex-1 flex justify-between items-center py-4">
        <div className="visitor-info flex-1 flex flex-col justify-center items-center py-4 gap-3">
          <div className="visitor-number text-6xl font-bold text-primary mb-4">
            {visitor.visitorNumber}
          </div>
          <div className="name text-3xl font-bold">
            {displayName}
          </div>
          <div className="company text-xl">
            {visitor.company}
          </div>
        </div>
        
        <div className="qr-code-container flex flex-col items-center justify-center p-4 ml-4 border border-gray-200 rounded-lg">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center w-28 h-28 bg-gray-100 rounded animate-pulse">
              <QrCode className="w-12 h-12 text-gray-300" />
            </div>
          ) : qrCodeUrl ? (
            <a 
              href={checkoutEmailUrl} 
              className="flex flex-col items-center"
              title="Scan to open email for checkout"
            >
              <img 
                src={qrCodeUrl} 
                alt={`QR Code for visitor ${visitor.visitorNumber}`} 
                className="w-28 h-28 object-contain"
              />
            </a>
          ) : (
            <div className="flex flex-col items-center justify-center w-28 h-28 bg-gray-100 rounded">
              <QrCode className="w-12 h-12 text-gray-400" />
              <div className="text-sm text-center mt-2 text-gray-500">
                QR code unavailable
              </div>
            </div>
          )}
          
          <div className="text-xs text-center mt-3 max-w-[160px]">
            <p className="font-bold">Scan to checkout</p>
            <p className="text-muted-foreground mt-1">Opens email to: besucher@leuka.de</p>
          </div>
        </div>
      </div>
      
      <div className="badge-footer border-t pt-2">
        <div className="contact text-lg">
          Contact: <span className="font-medium">{visitor.contact}</span>
        </div>
        <div className="date text-sm text-muted-foreground">
          {new Date(visitor.checkInTime).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default VisitorBadge;
