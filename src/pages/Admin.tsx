
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AdminHomeButton from "@/components/AdminHomeButton";
import { usePolicyStore } from "@/hooks/usePolicyStore";
import { useVisitorStore } from "@/hooks/useVisitorStore";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useLanguageStore, Language } from '@/hooks/useLanguageStore';
import ImageUploader from "@/components/ImageUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

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
    </div>
  );
};

export default Admin;
