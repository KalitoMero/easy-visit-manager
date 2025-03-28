import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import HomeButton from "@/components/HomeButton";
import { usePolicyStore } from "@/hooks/usePolicyStore";
import { useVisitorStore } from "@/hooks/useVisitorStore";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useLanguageStore, Language } from '@/hooks/useLanguageStore';
import ImageUploader from "@/components/ImageUploader";

const formatTime = (isoString: string, language: Language) => {
  if (!isoString) return "-";
  const locale = language === 'de' ? de : enUS;
  return format(new Date(isoString), 'dd.MM.yyyy HH:mm', { locale });
};

const Admin = () => {
  // Admin authentication handling
  const { isAuthenticated, login, logout, loading } = useAdminAuth();
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  // Visitor data
  const visitors = useVisitorStore((state) => state.visitors);

  // Sort visitors: active first, then by check-in time (newest first)
  const sortedVisitors = [...visitors].sort((a, b) => {
    // Active visitors first
    if (a.checkOutTime === null && b.checkOutTime !== null) return -1;
    if (a.checkOutTime !== null && b.checkOutTime === null) return 1;
    
    // Then sort by check-in time (newest first)
    return new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime();
  });

  // Filter active and inactive visitors
  const activeVisitors = sortedVisitors.filter(v => v.checkOutTime === null);
  const inactiveVisitors = sortedVisitors.filter(v => v.checkOutTime !== null);

  // Policy management
  const { policyText, policyImageUrl, updatePolicyText, updatePolicyImage } = usePolicyStore();
  const [germanPolicyText, setGermanPolicyText] = useState("");
  const [englishPolicyText, setEnglishPolicyText] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { language } = useLanguageStore();

  // Initialize policy text fields when component mounts or authentication changes
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(password);
    setPassword("");
  };

  if (loading) {
    return (
      <div className="app-container">
        <HomeButton />
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
        <HomeButton />
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
      <HomeButton />
      
      <div className="page-container">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin-Bereich</h1>
          <Button variant="outline" onClick={logout}>Abmelden</Button>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Aktive Besucher</TabsTrigger>
            <TabsTrigger value="inactive">Abgemeldete Besucher</TabsTrigger>
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
                          <TableCell>{visitor.name}</TableCell>
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
                          <TableCell>{visitor.name}</TableCell>
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
