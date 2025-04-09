
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { useTranslation } from '@/locale/translations';
import VisitorBadge from '@/components/VisitorBadge';
import { Printer, ArrowLeft } from 'lucide-react';

const BadgePrintPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const visitors = useVisitorStore(state => state.visitors);
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  
  // Find the current visitor
  const visitor = visitors.find(v => v.id === id);
  
  useEffect(() => {
    if (!visitor) {
      navigate('/');
    }
  }, [visitor, navigate]);
  
  if (!visitor) {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-container print:p-0">
      <div className="print:hidden flex justify-between items-center p-4 mb-4">
        <Button 
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate(`/checkin/step3/${visitor.id}`)}
        >
          <ArrowLeft size={16} />
          {t('back')}
        </Button>
        
        <Button 
          onClick={handlePrint}
          className="flex items-center gap-2"
        >
          <Printer size={16} />
          {t('print')}
        </Button>
      </div>
      
      <div className="page-container print:p-0 print:m-0 print:block">
        <div className="print:hidden mb-6">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">{t('badgePrintPreview')}</CardTitle>
            </CardHeader>
          </Card>
        </div>
        
        <div className="visitor-badges flex flex-col items-center gap-8 print:block print:gap-0">
          {/* Primary visitor badge */}
          <VisitorBadge visitor={visitor} />
          
          {/* Additional visitor badges in group */}
          {visitor.additionalVisitors?.map((additionalName, index) => (
            <VisitorBadge 
              key={`${visitor.id}-${index}`} 
              visitor={visitor} 
              name={additionalName} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BadgePrintPreview;
