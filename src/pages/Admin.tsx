
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NavButton from '@/components/NavButton';
import HomeButton from '@/components/HomeButton';
import VisitorCard from '@/components/VisitorCard';
import { useVisitorStore, Visitor } from '@/hooks/useVisitorStore';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const isAuthenticated = useAdminAuth(state => state.isAuthenticated);
  const login = useAdminAuth(state => state.login);
  const logout = useAdminAuth(state => state.logout);
  const visitors = useVisitorStore(state => state.visitors);

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
