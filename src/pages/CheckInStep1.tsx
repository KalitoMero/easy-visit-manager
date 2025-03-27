
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { useToast } from '@/hooks/use-toast';

const CheckInStep1 = () => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const addVisitor = useVisitorStore(state => state.addVisitor);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name fehlt",
        description: "Bitte geben Sie Ihren Namen ein",
        variant: "destructive",
      });
      return;
    }
    
    if (!company.trim()) {
      toast({
        title: "Firma fehlt",
        description: "Bitte geben Sie Ihre Firma ein",
        variant: "destructive",
      });
      return;
    }
    
    if (!contact.trim()) {
      toast({
        title: "Ansprechpartner fehlt",
        description: "Bitte geben Sie Ihren Ansprechpartner ein",
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
              <div>
                <Label htmlFor="name" className="text-lg block mb-2">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 text-lg bg-white/80 backdrop-blur-sm"
                  placeholder="Ihr vollständiger Name"
                  autoFocus
                  autoComplete="off"
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
                  autoComplete="off"
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
                  placeholder="Ihr Ansprechpartner"
                  autoComplete="off"
                />
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button type="submit" className="px-8 py-6 text-lg transition-all duration-300 hover:scale-105">
                  Weiter
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckInStep1;
