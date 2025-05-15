
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Visitor } from '@/hooks/useVisitorStore';
import { Printer, Eye, Download } from 'lucide-react';
import { 
  generateVisitorBadgePdf, 
  printPdf, 
  openPdfInNewTab, 
  saveBadgePdf 
} from '@/lib/pdfBadgeGenerator';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface VisitorPdfBadgeProps {
  visitor: Visitor;
  onPdfGenerated?: (pdfUrl: string) => void;
}

const VisitorPdfBadge = ({ visitor, onPdfGenerated }: VisitorPdfBadgeProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | undefined>(visitor.badgePdfUrl);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const generateBadge = async () => {
    try {
      setIsGenerating(true);
      const { pdfBlob, pdfUrl } = await generateVisitorBadgePdf(visitor);
      
      setGeneratedPdfUrl(pdfUrl);
      setPdfBlob(pdfBlob);
      
      if (onPdfGenerated) {
        onPdfGenerated(pdfUrl);
      }
      
      toast({
        title: "PDF generiert",
        description: `Besucherausweis für ${visitor.name} wurde generiert.`
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Fehler",
        description: "PDF konnte nicht generiert werden.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (generatedPdfUrl) {
      printPdf(generatedPdfUrl);
      toast({
        title: "Drucken",
        description: "Besucherausweis wird gedruckt..."
      });
    }
  };

  const handleView = () => {
    if (generatedPdfUrl) {
      openPdfInNewTab(generatedPdfUrl);
    }
  };

  const handleDownload = () => {
    if (pdfBlob) {
      saveBadgePdf(pdfBlob, visitor);
    } else if (generatedPdfUrl) {
      // If we only have the URL but not the blob, regenerate the PDF
      generateBadge().then(() => {
        if (pdfBlob) {
          saveBadgePdf(pdfBlob, visitor);
        }
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          {!generatedPdfUrl ? (
            <Button 
              onClick={generateBadge} 
              disabled={isGenerating}
              variant="outline"
              className="w-full"
            >
              {isGenerating ? "Generiere PDF..." : "PDF-Besucherausweis generieren"}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">
                PDF-Besucherausweis verfügbar
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleView} variant="outline" size="sm" className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>Anzeigen</span>
                </Button>
                <Button onClick={handlePrint} variant="outline" size="sm" className="flex items-center gap-1">
                  <Printer className="h-4 w-4" />
                  <span>Drucken</span>
                </Button>
                <Button onClick={handleDownload} variant="outline" size="sm" className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span>Herunterladen</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitorPdfBadge;
