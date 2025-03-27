
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { useToast } from '@/hooks/use-toast';

const CheckOut = () => {
  const [visitorNumber, setVisitorNumber] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const checkOutVisitor = useVisitorStore(state => state.checkOutVisitor);
  
  const handleCheckOut = () => {
    if (!visitorNumber) {
      toast({
        title: "Bitte geben Sie Ihre Besuchernummer ein",
        description: "Die Besuchernummer ist erforderlich",
        variant: "destructive",
      });
      return;
    }
    
    const number = parseInt(visitorNumber);
    if (isNaN(number)) {
      toast({
        title: "Ungültige Besuchernummer",
        description: "Bitte geben Sie eine gültige Nummer ein",
        variant: "destructive",
      });
      return;
    }
    
    const success = checkOutVisitor(number);
    if (success) {
      navigate('/checkout/success');
    } else {
      toast({
        title: "Abmeldung fehlgeschlagen",
        description: "Die angegebene Besuchernummer wurde nicht gefunden oder ist bereits abgemeldet",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="app-container">
      <HomeButton />
      
      <div className="page-container">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Besucherabmeldung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <p className="text-xl text-center">
              Bitte geben Sie Ihre Besuchernummer ein, um sich abzumelden.
            </p>
            
            <div className="max-w-md mx-auto">
              <Label htmlFor="visitorNumber" className="text-lg block mb-2">
                Besuchernummer
              </Label>
              <Input
                id="visitorNumber"
                value={visitorNumber}
                onChange={(e) => setVisitorNumber(e.target.value)}
                className="h-14 text-lg text-center bg-white/80 backdrop-blur-sm"
                placeholder="z.B. 101"
                type="number"
                autoFocus
              />
            </div>
            
            <div className="pt-4 flex justify-center">
              <Button 
                onClick={handleCheckOut}
                className="px-10 py-6 text-xl transition-all duration-300 hover:scale-105"
              >
                Abmelden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckOut;
