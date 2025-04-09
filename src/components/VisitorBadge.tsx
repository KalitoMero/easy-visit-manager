
import React from 'react';
import { Visitor } from '@/hooks/useVisitorStore';

interface VisitorBadgeProps {
  visitor: Visitor;
  name?: string; // Optional name for group visitors
}

const VisitorBadge = ({ visitor, name }: VisitorBadgeProps) => {
  // Use the provided name (for group visitors) or the primary visitor name
  const displayName = name || visitor.name;

  return (
    <div className="visitor-badge bg-white border border-gray-300 rounded-md p-6 w-[148mm] h-[105mm] flex flex-col justify-between print:break-after-page">
      <div className="badge-header border-b pb-2">
        <div className="text-2xl font-bold text-center">VISITOR</div>
      </div>
      
      <div className="badge-content flex-1 flex flex-col justify-center items-center py-8 gap-3">
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
