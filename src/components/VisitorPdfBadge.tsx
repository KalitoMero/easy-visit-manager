
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Visitor } from '@/hooks/useVisitorStore';
import { Printer, Eye, Download, AlertTriangle, RefreshCw } from 'lucide-react';
import { 
  generateVisitorBadgePdf, 
  printPdf, 
  openPdfInNewTab, 
  saveBadgePdf 
} from '@/lib/pdfBadgeGenerator';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VisitorPdfBadgeProps {
  visitor: Visitor;
  onPdfGenerated?: (pdfUrl: string) => void;
}

const VisitorPdfBadge = ({ visitor, onPdfGenerated }: VisitorPdfBadgeProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | undefined>(visitor.badgePdfUrl);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const generateBadge = async (retry = false) => {
    if (retry) {
      setRetryCount(prev => prev + 1);
    }
    
    try {
      setIsGenerating(true);
      setError(null);
      
      console.log("Starting PDF generation for visitor:", visitor.visitorNumber);
      const { pdfBlob, pdfUrl } = await generateVisitorBadgePdf(visitor);
      
      console.log("PDF generated successfully, blob size:", pdfBlob.size, "setting state");
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
      setError(`PDF konnte nicht generiert werden. ${error instanceof Error ? error.message : 'Unbekannter Fehler'}. Bitte versuchen Sie es erneut.`);
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
      try {
        printPdf(generatedPdfUrl);
        toast({
          title: "Drucken",
          description: "Besucherausweis wird gedruckt..."
        });
      } catch (error) {
        console.error("Print error:", error);
        toast({
          title: "Druckfehler",
          description: "Beim Drucken ist ein Fehler aufgetreten.",
          variant: "destructive"
        });
      }
    }
  };

  const handleView = () => {
    if (generatedPdfUrl) {
      try {
        openPdfInNewTab(generatedPdfUrl);
      } catch (error) {
        console.error("View error:", error);
        toast({
          title: "Anzeigefehler",
          description: "PDF konnte nicht angezeigt werden.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDownload = () => {
    if (pdfBlob) {
      try {
        saveBadgePdf(pdfBlob, visitor);
      } catch (error) {
        console.error("Download error:", error);
        toast({
          title: "Downloadfehler",
          description: "PDF konnte nicht heruntergeladen werden.",
          variant: "destructive"
        });
      }
    } else if (generatedPdfUrl) {
      // If we only have the URL but not the blob, regenerate the PDF
      generateBadge(true).then(() => {
        if (pdfBlob) {
          try {
            saveBadgePdf(pdfBlob, visitor);
          } catch (error) {
            console.error("Download error after regeneration:", error);
          }
        }
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          {error && (
            <Alert variant="destructive" className="mb-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{error}</p>
                {retryCount >= 2 && (
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-1"
                      onClick={() => setShowDebugInfo(!showDebugInfo)}
                    >
                      Debug-Information {showDebugInfo ? 'ausblenden' : 'anzeigen'}
                    </Button>
                    {showDebugInfo && (
                      <pre className="text-xs mt-2 bg-slate-100 p-2 rounded overflow-auto max-h-40">
                        Visitor: {JSON.stringify(visitor, null, 2)}
                        <br/>
                        Retry count: {retryCount}
                      </pre>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        
          {!generatedPdfUrl ? (
            <Button 
              onClick={() => generateBadge()}
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
                <Button 
                  onClick={() => generateBadge(true)} 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Neu generieren</span>
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
