
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Visitor } from '@/hooks/useVisitorStore';

interface VisitorCardProps {
  visitor: Visitor;
}

const VisitorCard = ({ visitor }: VisitorCardProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Noch anwesend';
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isCheckedOut = !!visitor.checkOutTime;

  return (
    <Card className={`mb-4 overflow-hidden transition-all duration-300 ${
      isCheckedOut ? 'bg-muted/50' : 'bg-card shadow-lg'
    }`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Besuchernummer: {visitor.visitorNumber}</p>
            <h3 className="text-xl font-semibold mb-1">{visitor.name}</h3>
            <p className="text-muted-foreground">{visitor.company}</p>
            <p className="text-sm mt-1">Ansprechpartner: {visitor.contact}</p>
          </div>
          <div className="text-right">
            <div className="text-sm">
              <span className="text-muted-foreground">Check-in: </span>
              <span>{formatDate(visitor.checkInTime)}</span>
            </div>
            <div className="text-sm mt-1">
              <span className="text-muted-foreground">Check-out: </span>
              <span className={!isCheckedOut ? 'text-primary font-medium' : ''}>
                {formatDate(visitor.checkOutTime)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitorCard;
