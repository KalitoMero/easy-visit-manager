
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import VisitorBadge from '@/components/VisitorBadge';

const BadgePrintPreview = () => {
  const { id } = useParams<{ id: string }>();
  const visitors = useVisitorStore(state => state.visitors);
  
  // Find the primary visitor
  const visitor = visitors.find(v => v.id === id);
  
  useEffect(() => {
    // Automatically trigger print dialog when component mounts
    if (visitor) {
      const timer = setTimeout(() => {
        window.print();
      }, 500); // Short delay to allow rendering
      
      return () => clearTimeout(timer);
    }
  }, [visitor]);
  
  if (!visitor) {
    return <div className="p-8 text-center">Visitor not found</div>;
  }
  
  // For group visitors, create a badge for each visitor
  const hasAdditionalVisitors = visitor.additionalVisitors && visitor.additionalVisitors.length > 0;
  
  return (
    <div className="p-4 flex flex-col gap-4 print:p-0">
      {/* Primary visitor badge */}
      <VisitorBadge visitor={visitor} />
      
      {/* Additional visitor badges */}
      {hasAdditionalVisitors && visitor.additionalVisitors?.map((additionalVisitor) => (
        <VisitorBadge 
          key={additionalVisitor.id}
          visitor={visitor} 
          name={additionalVisitor.name}
          visitorNumber={additionalVisitor.visitorNumber}
        />
      ))}
    </div>
  );
};

export default BadgePrintPreview;
