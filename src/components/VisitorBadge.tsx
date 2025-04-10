
import React, { useEffect, useState } from 'react';
import { Visitor } from '@/hooks/useVisitorStore';
import { generateCheckoutEmailUrl, generateQRCodeUrl } from '@/lib/qrCodeUtils';
import { QrCode, Mail } from 'lucide-react';

interface VisitorBadgeProps {
  visitor: Visitor;
  name?: string; // Optional name for group visitors
}

const VisitorBadge = ({ visitor, name }: VisitorBadgeProps) => {
  // Use the provided name (for group visitors) or the primary visitor name
  const displayName = name || visitor.name;
  const [qrCodeLoaded, setQrCodeLoaded] = useState(false);
  
  // Generate the checkout email URL directly
  const checkoutEmailUrl = generateCheckoutEmailUrl(visitor.visitorNumber);
  
  // Log the email URL for debugging
  useEffect(() => {
    console.log("Email checkout URL:", checkoutEmailUrl);
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
          {/* Direct email link with QR code icon */}
          <a 
            href={checkoutEmailUrl} 
            className="flex flex-col items-center justify-center w-40 h-40 bg-gray-50 rounded"
            title="Click to open email for checkout"
          >
            <QrCode className="w-20 h-20 text-primary mb-2" />
            <Mail className="w-10 h-10 text-primary" />
            <div className="text-sm text-center mt-2 font-medium">
              Visitor #{visitor.visitorNumber}
            </div>
          </a>
          <div className="text-xs text-center mt-3 max-w-[160px]">
            <p className="font-bold">Scan or click to checkout</p>
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
