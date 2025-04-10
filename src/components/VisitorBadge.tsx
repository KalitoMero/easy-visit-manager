
import React, { useEffect, useState } from 'react';
import { Visitor } from '@/hooks/useVisitorStore';
import { generateCheckoutEmailUrl, generateQRCodeUrl } from '@/lib/qrCodeUtils';
import { QrCode } from 'lucide-react';

interface VisitorBadgeProps {
  visitor: Visitor;
  name?: string; // Optional name for group visitors
}

const VisitorBadge = ({ visitor, name }: VisitorBadgeProps) => {
  // Use the provided name (for group visitors) or the primary visitor name
  const displayName = name || visitor.name;
  const [qrCodeLoaded, setQrCodeLoaded] = useState(false);
  
  // Generate the checkout email URL and QR code URL
  const checkoutEmailUrl = generateCheckoutEmailUrl(visitor.visitorNumber);
  const qrCodeUrl = generateQRCodeUrl(checkoutEmailUrl, 200); // Increase size for better scanning

  // Log to check QR code URL generation
  useEffect(() => {
    console.log("Generated QR code URL:", qrCodeUrl);
    console.log("For email link:", checkoutEmailUrl);
  }, [qrCodeUrl, checkoutEmailUrl]);

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
        
        <div className="qr-code-container flex flex-col items-center justify-center p-2 ml-4">
          {qrCodeUrl ? (
            <>
              <img 
                src={qrCodeUrl}
                alt="Checkout QR Code" 
                className="w-40 h-40 border border-gray-200 rounded"
                title="Scan to checkout"
                onLoad={() => setQrCodeLoaded(true)}
                onError={(e) => {
                  console.error("Failed to load QR code image:", e);
                  setQrCodeLoaded(false);
                }}
              />
              {!qrCodeLoaded && <QrCode className="w-40 h-40 text-gray-300" />}
              <div className="text-xs text-center mt-2 font-medium">
                Scan for checkout
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <QrCode className="w-40 h-40 text-gray-300" />
              <div className="text-xs text-center mt-2">
                QR Code not available
              </div>
            </div>
          )}
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
