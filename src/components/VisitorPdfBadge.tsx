
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Visitor } from '@/hooks/useVisitorStore';
import { Printer, Eye, Download, AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { 
  generateVisitorBadgePdf, 
  printPdf, 
  openPdfInNewTab, 
  saveBadgePdf 
} from '@/lib/pdfBadgeGenerator';
import { logDebug, isPdfMakeInitialized } from '@/lib/debugUtils';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
  const [browserInfo, setBrowserInfo] = useState<Record<string, any>>({});
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [isPdfLibraryReady, setIsPdfLibraryReady] = useState(false);

  // Run browser checks on mount
  useEffect(() => {
    const runBrowserChecks = async () => {
      try {
        const info: Record<string, any> = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          vendor: navigator.vendor,
          hasBlob: typeof Blob !== 'undefined',
          hasURL: typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function',
          hasPromise: typeof Promise !== 'undefined',
          windowOuterWidth: window.outerWidth,
          windowOuterHeight: window.outerHeight,
          windowInnerWidth: window.innerWidth,
          windowInnerHeight: window.innerHeight,
          isSecureContext: window.isSecureContext,
          hasPdfMake: typeof window.pdfMake !== 'undefined',
          hasPdfMakeFonts: (typeof window.pdfMake !== 'undefined') && (typeof window.pdfMake.vfs !== 'undefined'),
        };
        
        setIsPdfLibraryReady(isPdfMakeInitialized());
        
        setBrowserInfo(info);
        logDebug('Browser', 'Browser information collected', info);
      } catch (e) {
        logDebug('Browser', 'Error collecting browser info', e);
      }
    };
    
    runBrowserChecks();
    
    // Setup log capture
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      if (args[0] && typeof args[0] === 'string' && args[0].includes('[')) {
        // Capture only our formatted debug logs
        setDiagnosticLogs(prev => {
          const newLogs = [...prev, args.map(a => 
            typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
          ).join(' ')];
          // Keep last 50 logs
          return newLogs.slice(Math.max(0, newLogs.length - 50));
        });
      }
    };
    
    return () => {
      console.log = originalLog;
    };
  }, []);

  const generateBadge = async (retry = false) => {
    if (retry) {
      setRetryCount(prev => prev + 1);
    }
    
    try {
      // Check PDF library availability first
      if (!isPdfMakeInitialized()) {
        setError("PDF-Bibliothek ist nicht richtig initialisiert. Bitte laden Sie die Seite neu.");
        toast({
          title: "Fehler",
          description: "PDF-Bibliothek ist nicht initialisiert.",
          variant: "destructive"
        });
        return;
      }
      
      setIsGenerating(true);
      setError(null);
      
      logDebug('Badge', "Starting PDF generation for visitor:", visitor.visitorNumber);
      const { pdfBlob, pdfUrl } = await generateVisitorBadgePdf(visitor);
      
      logDebug('Badge', "PDF generated successfully", { blobSize: pdfBlob.size });
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
      logDebug('Badge', "Error generating PDF", error);
      const errorMsg = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setError(`PDF konnte nicht generiert werden. ${errorMsg}. Bitte versuchen Sie es erneut.`);
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
        logDebug('Badge', "Printing PDF", generatedPdfUrl);
        printPdf(generatedPdfUrl);
        toast({
          title: "Drucken",
          description: "Besucherausweis wird gedruckt..."
        });
      } catch (error) {
        logDebug('Badge', "Print error", error);
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
        logDebug('Badge', "Opening PDF in new tab", generatedPdfUrl);
        openPdfInNewTab(generatedPdfUrl);
      } catch (error) {
        logDebug('Badge', "View error", error);
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
        logDebug('Badge', "Downloading PDF", { blobSize: pdfBlob.size });
        saveBadgePdf(pdfBlob, visitor);
      } catch (error) {
        logDebug('Badge', "Download error", error);
        toast({
          title: "Downloadfehler",
          description: "PDF konnte nicht heruntergeladen werden.",
          variant: "destructive"
        });
      }
    } else if (generatedPdfUrl) {
      // If we only have the URL but not the blob, regenerate the PDF
      logDebug('Badge', "Missing PDF blob, regenerating before download");
      generateBadge(true).then(() => {
        if (pdfBlob) {
          try {
            saveBadgePdf(pdfBlob, visitor);
          } catch (error) {
            logDebug('Badge', "Download error after regeneration", error);
          }
        }
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          {!isPdfLibraryReady && (
            <Alert variant="destructive" className="mb-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>PDF-Library nicht initialisiert</AlertTitle>
              <AlertDescription>
                Die PDF-Bibliothek konnte nicht geladen werden. Bitte laden Sie die Seite neu oder verwenden Sie einen anderen Browser.
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Fehler</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{error}</p>
                {retryCount >= 1 && (
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-1"
                      onClick={() => setShowDebugInfo(!showDebugInfo)}
                    >
                      <Bug className="h-4 w-4 mr-1" />
                      Debug-Information {showDebugInfo ? 'ausblenden' : 'anzeigen'}
                    </Button>
                    
                    {showDebugInfo && (
                      <Accordion type="single" collapsible className="mt-2">
                        <AccordionItem value="visitor-info">
                          <AccordionTrigger className="text-xs py-1">Besucher-Information</AccordionTrigger>
                          <AccordionContent>
                            <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-40">
                              {JSON.stringify(visitor, null, 2)}
                            </pre>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="browser-info">
                          <AccordionTrigger className="text-xs py-1">Browser-Information</AccordionTrigger>
                          <AccordionContent>
                            <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-40">
                              {JSON.stringify(browserInfo, null, 2)}
                            </pre>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="diagnostic-logs">
                          <AccordionTrigger className="text-xs py-1">Diagnose-Protokolle</AccordionTrigger>
                          <AccordionContent>
                            <div className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-40 font-mono whitespace-pre-wrap">
                              {diagnosticLogs.map((log, i) => (
                                <div key={i} className="py-0.5 border-b border-slate-200 last:border-0">
                                  {log}
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="retry-info">
                          <AccordionTrigger className="text-xs py-1">Wiederholungs-Information</AccordionTrigger>
                          <AccordionContent>
                            <div className="text-xs bg-slate-100 p-2 rounded">
                              <p>Wiederholungsversuche: {retryCount}</p>
                              <p>URL: {generatedPdfUrl ? 'Verfügbar' : 'Nicht verfügbar'}</p>
                              <p>Blob: {pdfBlob ? `Verfügbar (${pdfBlob.size} bytes)` : 'Nicht verfügbar'}</p>
                              <p>PDF Library: {isPdfLibraryReady ? 'Initialisiert' : 'Nicht initialisiert'}</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        
          {!generatedPdfUrl ? (
            <Button 
              onClick={() => generateBadge()}
              disabled={isGenerating || !isPdfLibraryReady}
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
                  disabled={isGenerating || !isPdfLibraryReady}
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
