
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import NavButton from '@/components/NavButton';
import HomeButton from '@/components/HomeButton';
import VisitorCard from '@/components/VisitorCard';
import { useVisitorStore, Visitor } from '@/hooks/useVisitorStore';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { usePolicyStore } from '@/hooks/usePolicyStore';
import { useToast } from '@/hooks/use-toast';
import { Image } from 'lucide-react';

const Admin = () => {
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const isAuthenticated = useAdminAuth(state => state.isAuthenticated);
  const login = useAdminAuth(state => state.login);
  const logout = useAdminAuth(state => state.logout);
  const visitors = useVisitorStore(state => state.visitors);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Policy store
  const policyText = usePolicyStore(state => state.policyText);
  const policyImageUrl = usePolicyStore(state => state.policyImageUrl);
  const updatePolicyText = usePolicyStore(state => state.updatePolicyText);
  const updatePolicyImage = usePolicyStore(state => state.updatePolicyImage);
  
  const [editablePolicyText, setEditablePolicyText] = useState(policyText);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      toast({
        title: "Anmeldung erfolgreich",
        description: "Sie sind jetzt als Administrator angemeldet",
      });
    } else {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: "Falsches Passwort",
        variant: "destructive",
      });
    }
    setPassword('');
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Abmeldung erfolgreich",
      description: "Sie wurden als Administrator abgemeldet",
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Ungültiger Dateityp",
          description: "Bitte wählen Sie eine Bilddatei (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updatePolicyImage(imageUrl);
        toast({
          title: "Bild hochgeladen",
          description: "Das Bild wurde erfolgreich hochgeladen",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePolicy = () => {
    updatePolicyText(editablePolicyText);
    toast({
      title: "Richtlinien gespeichert",
      description: "Die Besucherrichtlinien wurden aktualisiert",
    });
  };

  const handleRemoveImage = () => {
    updatePolicyImage(null);
    toast({
      title: "Bild entfernt",
      description: "Das Bild wurde erfolgreich entfernt",
    });
  };

  // Sort visitors by check-in time (newest first)
  const sortedVisitors = [...visitors].sort((a, b) => 
    new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
  );

  // Filter for active visitors (not checked out)
  const activeVisitors = sortedVisitors.filter(v => v.checkOutTime === null);
  
  // Filter for inactive visitors (checked out)
  const inactiveVisitors = sortedVisitors.filter(v => v.checkOutTime !== null);

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <HomeButton />
        
        <div className="page-container max-w-md">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Admin-Bereich</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <p className="text-center mb-6">
                    Bitte geben Sie das Admin-Passwort ein.
                  </p>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 text-lg"
                    placeholder="Passwort"
                    autoFocus
                  />
                </div>
                
                <div className="pt-4 flex justify-center">
                  <Button type="submit" className="w-full">
                    Anmelden
                  </Button>
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
          <Button variant="outline" onClick={handleLogout}>
            Abmelden
          </Button>
        </div>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="active" className="flex-1">
              Aktive Besucher ({activeVisitors.length})
            </TabsTrigger>
            <TabsTrigger value="inactive" className="flex-1">
              Abgemeldete Besucher ({inactiveVisitors.length})
            </TabsTrigger>
            <TabsTrigger value="policy" className="flex-1">
              Besucherrichtlinien
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {activeVisitors.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Keine aktiven Besucher vorhanden</p>
                </CardContent>
              </Card>
            ) : (
              activeVisitors.map(visitor => (
                <VisitorCard key={visitor.id} visitor={visitor} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="inactive" className="space-y-4">
            {inactiveVisitors.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Keine abgemeldeten Besucher vorhanden</p>
                </CardContent>
              </Card>
            ) : (
              inactiveVisitors.map(visitor => (
                <VisitorCard key={visitor.id} visitor={visitor} />
              ))
            )}
          </TabsContent>

          <TabsContent value="policy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bearbeiten der Besucherrichtlinien</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="policyText">Richtlinientext (HTML erlaubt)</Label>
                  <Textarea 
                    id="policyText" 
                    value={editablePolicyText}
                    onChange={(e) => setEditablePolicyText(e.target.value)}
                    className="h-72 font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Vorschau</Label>
                  <ScrollArea className="h-72 rounded-md border p-4 bg-white/80 backdrop-blur-sm">
                    <div 
                      className="p-4 text-lg"
                      dangerouslySetInnerHTML={{ __html: editablePolicyText }}
                    />
                  </ScrollArea>
                </div>

                <div className="space-y-2">
                  <Label>Richtlinienbild</Label>
                  
                  {policyImageUrl ? (
                    <div className="space-y-4">
                      <div className="rounded-md border overflow-hidden">
                        <img 
                          src={policyImageUrl} 
                          alt="Richtlinienbild" 
                          className="max-h-64 w-auto mx-auto"
                        />
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={handleRemoveImage}
                        className="w-full"
                      >
                        Bild entfernen
                      </Button>
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-md p-8 text-center space-y-4 bg-white/80 backdrop-blur-sm">
                      <div className="flex justify-center">
                        <Image className="h-16 w-16 text-gray-400" />
                      </div>
                      <div>
                        <p className="mb-2">Kein Bild hochgeladen</p>
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG oder GIF, max. 10MB
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Bild auswählen
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleSavePolicy}
                  className="w-full"
                >
                  Richtlinien speichern
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="pt-6">
          <NavButton to="/" position="center" variant="outline">
            Zurück zur Startseite
          </NavButton>
        </div>
      </div>
    </div>
  );
};

export default Admin;
