
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Visitor, useVisitorStore } from '@/hooks/useVisitorStore';
import { useToast } from "@/hooks/use-toast";
import AdminHomeButton from "@/components/AdminHomeButton";
import { usePolicyStore } from "@/hooks/usePolicyStore";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useLanguageStore, Language } from '@/hooks/useLanguageStore';
import ImageUploader from "@/components/ImageUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePrinterSettings } from "@/hooks/usePrinterSettings";
import { Printer, Settings, Move, Layout } from "lucide-react";
import BadgePositionPreview from "@/components/BadgePositionPreview";
import BadgeLayoutSettings from "@/components/BadgeLayoutSettings";
import VisitorBadge from "@/components/VisitorBadge";

const formatTime = (isoString: string, language: Language) => {
  if (!isoString) return "-";
  const locale = language === 'de' ? de : enUS;
  return format(new Date(isoString), 'dd.MM.yyyy HH:mm', { locale });
};

const formatVisitorNames = (visitor) => {
  if (!visitor.additionalVisitors || visitor.additionalVisitors.length === 0) {
    return visitor.name;
  }
  
  return (
    <div>
      <div>{visitor.name} <span className="text-xs text-muted-foreground">(Hauptbesucher)</span></div>
      {visitor.additionalVisitors.map((additionalName, index) => (
        <div key={index} className="text-sm pl-3 mt-1">+ {additionalName}</div>
      ))}
    </div>
  );
};

const Admin = () => {
  const { isAuthenticated, login, logout, loading } = useAdminAuth();
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const visitors = useVisitorStore((state) => state.visitors);
  const deletionSchedule = useVisitorStore((state) => state.deletionSchedule);
  const updateDeletionSchedule = useVisitorStore((state) => state.updateDeletionSchedule);
  const deleteOldVisitors = useVisitorStore((state) => state.deleteOldVisitors);
  
  const [deletionEnabled, setDeletionEnabled] = useState(false);
  const [deletionDay, setDeletionDay] = useState("0");
  const [deletionHour, setDeletionHour] = useState("3");
  const [deletionMinute, setDeletionMinute] = useState("0");
  
  useEffect(() => {
    console.log("Loaded visitors in Admin:", visitors);
  }, [visitors]);

  useEffect(() => {
    if (isAuthenticated) {
      setDeletionEnabled(deletionSchedule.enabled);
      setDeletionDay(deletionSchedule.dayOfWeek.toString());
      setDeletionHour(deletionSchedule.hour.toString());
      setDeletionMinute(deletionSchedule.minute.toString());
    }
  }, [isAuthenticated, deletionSchedule]);

  const sortedVisitors = [...visitors].sort((a, b) => {
    if (a.checkOutTime === null && b.checkOutTime !== null) return -1;
    if (a.checkOutTime !== null && b.checkOutTime === null) return 1;
    
    return new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime();
  });

  const activeVisitors = sortedVisitors.filter(v => v.checkOutTime === null);
  const inactiveVisitors = sortedVisitors.filter(v => v.checkOutTime !== null);

  const { policyText, policyImageUrl, updatePolicyText, updatePolicyImage } = usePolicyStore();
  const [germanPolicyText, setGermanPolicyText] = useState("");
  const [englishPolicyText, setEnglishPolicyText] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { language } = useLanguageStore();

  useEffect(() => {
    if (isAuthenticated) {
      setGermanPolicyText(policyText.de);
      setEnglishPolicyText(policyText.en);
      setUploadedImage(policyImageUrl || null);
    }
  }, [isAuthenticated, policyText, policyImageUrl]);

  const handleImageSelect = (imageBase64: string) => {
    setUploadedImage(imageBase64);
  };

  const handleSavePolicy = () => {
    updatePolicyText(germanPolicyText, 'de');
    updatePolicyText(englishPolicyText, 'en');
    updatePolicyImage(uploadedImage);
    
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Besucherrichtlinien wurden aktualisiert.",
    });
  };

  const handleSaveDeletionSchedule = () => {
    updateDeletionSchedule(
      deletionEnabled, 
      parseInt(deletionDay), 
      parseInt(deletionHour), 
      parseInt(deletionMinute)
    );
    
    toast({
      title: "Einstellungen gespeichert",
      description: "Der Zeitplan für die automatische Löschung wurde aktualisiert.",
    });
  };

  const handleManualDeletion = () => {
    const deletedCount = deleteOldVisitors();
    
    toast({
      title: "Datenlöschung durchgeführt",
      description: `${deletedCount} abgemeldete Besucher wurden gelöscht.`,
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(password);
    setPassword("");
  };

  const weekdays = [
    { value: "0", label: "Sonntag" },
    { value: "1", label: "Montag" },
    { value: "2", label: "Dienstag" },
    { value: "3", label: "Mittwoch" },
    { value: "4", label: "Donnerstag" },
    { value: "5", label: "Freitag" },
    { value: "6", label: "Samstag" },
  ];

  // Generate hours (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => ({
    value: i.toString(),
    label: i.toString().padStart(2, '0'),
  }));

  // Generate minutes (0-59)
  const minutes = Array.from({ length: 60 }, (_, i) => ({
    value: i.toString(),
    label: i.toString().padStart(2, '0'),
  }));

  const { 
    enableAutomaticPrinting, 
    printWithoutDialog, 
    printDelay,
    showBrandingOnPrint,
    setPrintWithoutDialog,
    setEnableAutomaticPrinting,
    setPrintDelay,
    setShowBrandingOnPrint
  } = usePrinterSettings();
  
  const handleSavePrinterSettings = () => {
    toast({
      title: "Druckereinstellungen gespeichert",
      description: "Die Einstellungen für den Ausweis-Druck wurden aktualisiert.",
    });
  };

  const [availablePrinters, setAvailablePrinters] = useState<any[]>([]);
  const [isElectron, setIsElectron] = useState(false);
  
  // Check if we're running in Electron
  useEffect(() => {
    const electron = window.electronAPI && window.electronAPI.isElectron === true;
    setIsElectron(electron);
    
    // Load printer list if in Electron
    const loadPrinters = async () => {
      if (electron) {
        try {
          const printers = await window.electronAPI!.getPrinters();
          setAvailablePrinters(printers);
          console.log('Available printers:', printers);
        } catch (error) {
          console.error('Failed to get printers:', error);
        }
      }
    };
    
    loadPrinters();
  }, []);

  const handleTestPrint = () => {
    if (isElectron && window.electronAPI) {
      // In Electron, use the Electron print API
      if (visitors.length > 0) {
        const testVisitorId = visitors[0].id;
        window.electronAPI.printBadge({
          id: testVisitorId,
          name: visitors[0].name
        }).then(result => {
          if (result.success) {
            toast({
              title: "Testdruck erfolgreich",
              description: "Der Ausweis wurde erfolgreich gedruckt.",
            });
          } else {
            toast({
              title: "Testdruck fehlgeschlagen",
              description: result.message || "Unbekannter Fehler",
              variant: "destructive",
            });
          }
        });
      } else {
        toast({
          title: "Kein Besucher vorhanden",
          description: "Es muss mindestens ein Besucher im System sein, um einen Testdruck durchzuführen.",
          variant: "destructive",
        });
      }
    } else {
      // In browser, use the standard approach
      if (visitors.length > 0) {
        const testVisitorId = visitors[0].id;
        window.open(`/print-badge/${testVisitorId}`, '_blank');
      } else {
        toast({
          title: "Kein Besucher vorhanden",
          description: "Es muss mindestens ein Besucher im System sein, um einen Testdruck durchzuführen.",
          variant: "destructive",
        });
      }
    }
  };

  const [selectedPrinterName, setSelectedPrinterName] = useState<string>("");
  const [printCopies, setPrintCopies] = useState(1);

  if (loading) {
    return (
      <div className="app-container">
        <AdminHomeButton />
        <div className="page-container max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center items-center h-40">
                <p className="text-lg">Laden...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <AdminHomeButton />
        <div className="page-container max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Admin Login</CardTitle>
              <CardDescription>Bitte geben Sie das Administrator-Passwort ein</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Passwort</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <Button type="submit">Anmelden</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const previewVisitor: Visitor = {
    id: "preview-1",
    name: "John Doe",
    company: "ACME Corporation",
    contact: "john.doe@example.com",
    visitorNumber: 1001,
    checkInTime: new Date().toISOString(),
    checkOutTime: null,
    additionalVisitorCount: 0, // Adding the required property
    policyAccepted: true
  };

  return (
    <div className="app-container">
      <AdminHomeButton />
      
      <div className="page-container">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin-Bereich</h1>
          <Button variant="outline" onClick={logout}>Abmelden</Button>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Aktive Besucher</TabsTrigger>
            <TabsTrigger value="inactive">Abgemeldete Besucher</TabsTrigger>
            <TabsTrigger value="settings">Einstellungen</TabsTrigger>
            <TabsTrigger value="printer">Drucker</TabsTrigger>
            <TabsTrigger value="badge-layout">Ausweis-Layout</TabsTrigger>
            <TabsTrigger value="policy">Besucherrichtlinien</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Aktive Besucher ({activeVisitors.length})</CardTitle>
                <CardDescription>Liste aller aktuell angemeldeten Besucher</CardDescription>
              </CardHeader>
              <CardContent>
                {activeVisitors.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">Keine aktiven Besucher vorhanden</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nr.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Firma</TableHead>
                        <TableHead>Ansprechpartner</TableHead>
                        <TableHead>Anmeldung</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeVisitors.map(visitor => (
                        <TableRow key={visitor.id}>
                          <TableCell>{visitor.visitorNumber}</TableCell>
                          <TableCell>{formatVisitorNames(visitor)}</TableCell>
                          <TableCell>{visitor.company}</TableCell>
                          <TableCell>{visitor.contact}</TableCell>
                          <TableCell>{formatTime(visitor.checkInTime, language)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inactive">
            <Card>
              <CardHeader>
                <CardTitle>Abgemeldete Besucher ({inactiveVisitors.length})</CardTitle>
                <CardDescription>Liste aller abgemeldeten Besucher</CardDescription>
              </CardHeader>
              <CardContent>
                {inactiveVisitors.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">Keine abgemeldeten Besucher vorhanden</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nr.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Firma</TableHead>
                        <TableHead>Ansprechpartner</TableHead>
                        <TableHead>Anmeldung</TableHead>
                        <TableHead>Abmeldung</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inactiveVisitors.map(visitor => (
                        <TableRow key={visitor.id}>
                          <TableCell>{visitor.visitorNumber}</TableCell>
                          <TableCell>{formatVisitorNames(visitor)}</TableCell>
                          <TableCell>{visitor.company}</TableCell>
                          <TableCell>{visitor.contact}</TableCell>
                          <TableCell>{formatTime(visitor.checkInTime, language)}</TableCell>
                          <TableCell>{formatTime(visitor.checkOutTime || '', language)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Automatische Datenlöschung</CardTitle>
                <CardDescription>Konfigurieren Sie, wann abgemeldete Besucherdaten automatisch gelöscht werden sollen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="deletion-enabled"
                    checked={deletionEnabled}
                    onCheckedChange={setDeletionEnabled}
                  />
                  <Label htmlFor="deletion-enabled">Automatische Löschung aktivieren</Label>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="deletion-day">Wochentag</Label>
                    <Select 
                      disabled={!deletionEnabled} 
                      value={deletionDay} 
                      onValueChange={setDeletionDay}
                    >
                      <SelectTrigger id="deletion-day">
                        <SelectValue placeholder="Wochentag wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {weekdays.map(day => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deletion-hour">Stunde</Label>
                    <Select 
                      disabled={!deletionEnabled} 
                      value={deletionHour} 
                      onValueChange={setDeletionHour}
                    >
                      <SelectTrigger id="deletion-hour">
                        <SelectValue placeholder="Stunde wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {hours.map(hour => (
                          <SelectItem key={hour.value} value={hour.value}>
                            {hour.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deletion-minute">Minute</Label>
                    <Select 
                      disabled={!deletionEnabled} 
                      value={deletionMinute} 
                      onValueChange={setDeletionMinute}
                    >
                      <SelectTrigger id="deletion-minute">
                        <SelectValue placeholder="Minute wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {minutes.map(minute => (
                          <SelectItem key={minute.value} value={minute.value}>
                            {minute.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {deletionSchedule.lastRun && (
                  <p className="text-sm text-muted-foreground">
                    Zuletzt ausgeführt: {formatTime(deletionSchedule.lastRun, language)}
                  </p>
                )}
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleManualDeletion} 
                    disabled={inactiveVisitors.length === 0}
                  >
                    Jetzt manuell löschen ({inactiveVisitors.length})
                  </Button>
                  
                  <Button onClick={handleSaveDeletionSchedule}>
                    Einstellungen speichern
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="printer">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Drucker-Einstellungen
                </CardTitle>
                <CardDescription>
                  Konfigurieren Sie die Druckeinstellungen für Besucherausweise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="automatic-printing"
                    checked={enableAutomaticPrinting}
                    onCheckedChange={setEnableAutomaticPrinting}
                  />
                  <Label htmlFor="automatic-printing">Automatischen Druck aktivieren</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="print-without-dialog"
                    checked={printWithoutDialog}
                    onCheckedChange={setPrintWithoutDialog}
                  />
                  <Label htmlFor="print-without-dialog">Druckdialog unterdrücken (erfordert Kiosk-Modus)</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="show-branding-on-print"
                    checked={showBrandingOnPrint}
                    onCheckedChange={setShowBrandingOnPrint}
                  />
                  <Label htmlFor="show-branding-on-print">Branding auf Ausdruck anzeigen</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="print-delay">Verzögerung vor Druckvorgang (ms)</Label>
                  <Input
                    id="print-delay"
                    type="number"
                    value={printDelay}
                    onChange={(e) => setPrintDelay(Number(e.target.value))}
                    min={0}
                    max={5000}
                    step={100}
                    disabled={!enableAutomaticPrinting}
                  />
                  <p className="text-sm text-muted-foreground">
                    Kurze Verzögerung, um sicherzustellen, dass der Ausweis vollständig geladen ist, bevor der Druck gestartet wird
                  </p>
                </div>
                
                <div className="pt-4 pb-2">
                  <h3 className="text-lg font-semibold">Ausweispositionierung und Rotation</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Stellen Sie die Position und Drehung der Besucherausweise auf der Druckseite ein
                  </p>
                  
                  <BadgePositionPreview />
                </div>
                
                {isElectron && (
                  <div className="space-y-2">
                    <Label htmlFor="printer-selection">Drucker auswählen</Label>
                    <Select 
                      value={selectedPrinterName || ""} 
                      onValueChange={setSelectedPrinterName}
                      disabled={!enableAutomaticPrinting}
                    >
                      <SelectTrigger id="printer-selection">
                        <SelectValue placeholder="Standard-Drucker verwenden" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Standard-Drucker verwenden</SelectItem>
                        {availablePrinters.map(printer => (
                          <SelectItem key={printer.name} value={printer.name}>
                            {printer.name} {printer.isDefault ? "(Standard)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Der gewählte Drucker wird für alle automatischen Druckvorgänge verwendet
                    </p>
                  </div>
                )}
                
                {isElectron && (
                  <div className="space-y-2">
                    <Label htmlFor="print-copies">Anzahl Kopien</Label>
                    <Input
                      id="print-copies"
                      type="number"
                      value={printCopies}
                      onChange={(e) => setPrintCopies(Number(e.target.value))}
                      min={1}
                      max={10}
                      disabled={!enableAutomaticPrinting}
                    />
                    <p className="text-sm text-muted-foreground">
                      Anzahl der zu druckenden Exemplare pro Ausweis
                    </p>
                  </div>
                )}
                
                {isElectron ? (
                  <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
                    <CardContent className="p-4 space-y-2">
                      <h3 className="text-lg font-medium flex items-center gap-1">
                        <Settings className="h-4 w-4" /> Electron Desktop App
                      </h3>
                      <p className="text-sm">
                        Diese Anwendung läuft als Electron Desktop App. Dies ermöglicht verbesserte Druckfunktionen und Kiosk-Modus ohne zusätzliche Browser-Flags.
                      </p>
                      <p className="text-sm font-medium">
                        App-Version: {window.electronAPI ? window.electronAPI.getVersion() : '1.0.0'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900">
                    <CardContent className="p-4 space-y-2">
                      <h3 className="text-lg font-medium flex items-center gap-1">
                        <Settings className="h-4 w-4" /> Kiosk-Modus Anleitung
                      </h3>
                      <p className="text-sm">
                        Für vollständig automatischen Druck ohne Dialog muss Chrome/Chromium mit speziellen Parametern gestartet werden:
                      </p>
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded font-mono text-xs overflow-x-auto">
                        chrome.exe --kiosk-printing
                      </div>
                      <p className="text-sm">
                        Dies aktiviert den Kiosk-Druck-Modus, bei dem Druckaufträge ohne Dialog direkt an den Standarddrucker gesendet werden.
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleTestPrint}
                  >
                    <Printer className="mr-1" /> Testdruck
                  </Button>
                  
                  <Button onClick={handleSavePrinterSettings}>
                    Einstellungen speichern
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="badge-layout">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Ausweis-Layout Einstellungen
                </CardTitle>
                <CardDescription>
                  Passen Sie das Layout der Besucherausweise an
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <BadgeLayoutSettings className="md:col-span-1" />
                  
                  <div className="md:col-span-1 space-y-4">
                    <h3 className="text-lg font-semibold">Vorschau</h3>
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                      <div className="scale-75 transform-gpu">
                        <VisitorBadge 
                          visitor={previewVisitor}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="policy">
            <Card>
              <CardHeader>
                <CardTitle>Besucherrichtlinien</CardTitle>
                <CardDescription>Bearbeiten Sie die Richtlinien und optionales Bild</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="policyImage">Bild (optional)</Label>
                  <ImageUploader 
                    onImageSelect={handleImageSelect} 
                    currentImage={uploadedImage}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Bild wird oberhalb der Richtlinien angezeigt
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="germanPolicyText">Richtlinien Text (Deutsch)</Label>
                  <Textarea
                    id="germanPolicyText"
                    placeholder="Geben Sie hier den Text für die Besucherrichtlinien ein..."
                    value={germanPolicyText}
                    onChange={(e) => setGermanPolicyText(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Textformatierung wird genau so übernommen wie eingegeben
                  </p>
                </div>

                <div>
                  <Label htmlFor="englishPolicyText">Richtlinien Text (Englisch)</Label>
                  <Textarea
                    id="englishPolicyText"
                    placeholder="Enter the visitor policy text here..."
                    value={englishPolicyText}
                    onChange={(e) => setEnglishPolicyText(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Text formatting is preserved exactly as entered
                  </p>
                </div>
                
                <Button onClick={handleSavePolicy} className="w-full">
                  Änderungen speichern
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {isElectron && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Daten-Management</CardTitle>
            <CardDescription>Exportieren und importieren Sie Besucherdaten</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={async () => {
                  const result = await window.electronAPI!.exportVisitors();
                  if (result.success) {
                    toast({
                      title: "Export erfolgreich",
                      description: `Daten wurden nach ${result.path} exportiert.`
                    });
                  } else {
                    toast({
                      title: "Export fehlgeschlagen",
                      description: result.message,
                      variant: "destructive"
                    });
                  }
                }}
              >
                Besucherdaten exportieren
              </Button>
              
              <Button
                variant="outline"
                onClick={async () => {
                  const result = await window.electronAPI!.importVisitors();
                  if (result.success) {
                    toast({
                      title: "Import erfolgreich",
                      description: `${result.visitors?.length || 0} Besucher importiert.`
                    });
                    // Force reload to update UI
                    window.location.reload();
                  } else {
                    toast({
                      title: "Import fehlgeschlagen",
                      description: result.message,
                      variant: "destructive"
                    });
                  }
                }}
              >
                Besucherdaten importieren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Admin;
