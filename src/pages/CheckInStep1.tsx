
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import NavButton from '@/components/NavButton';
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { useToast } from '@/hooks/use-toast';

const CheckInStep1 = () => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const addVisitor = useVisitorStore(state => state.addVisitor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !company.trim() || !contact.trim()) {
      toast({
        title: "Bitte alle Felder ausfüllen",
        description: "Name, Firma und Ansprechpartner sind erforderlich",
        variant: "destructive",
      });
      return;
    }
    
    const visitor = addVisitor(name, company, contact);
    navigate(`/checkin/step2/${visitor.id}`);
  };

  return (
    <div className="app-container">
      <HomeButton />
      
      <div className="page-container">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Besucheranmeldung</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-lg block mb-2">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 text-lg bg-white/80 backdrop-blur-sm"
                    placeholder="Vor- und Nachname"
                    autoFocus
                  />
                </div>
                
                <div>
                  <Label htmlFor="company" className="text-lg block mb-2">
                    Firma
                  </Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="h-14 text-lg bg-white/80 backdrop-blur-sm"
                    placeholder="Ihre Firma"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact" className="text-lg block mb-2">
                    Ansprechpartner
                  </Label>
                  <Input
                    id="contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="h-14 text-lg bg-white/80 backdrop-blur-sm"
                    placeholder="Name des Ansprechpartners"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <NavButton to="#" position="right" onClick={handleSubmit}>
                  Weiter
                </NavButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckInStep1;
