
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import NavButton from '@/components/NavButton';
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { useToast } from '@/hooks/use-toast';

const CheckInStep2 = () => {
  const { id } = useParams<{ id: string }>();
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const acceptPolicy = useVisitorStore(state => state.acceptPolicy);
  const visitors = useVisitorStore(state => state.visitors);
  
  // Find the current visitor
  const visitor = visitors.find(v => v.id === id);
  
  if (!visitor) {
    return (
      <div className="app-container">
        <HomeButton />
        <div className="page-container">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-xl">Besucher nicht gefunden. Bitte starten Sie erneut.</p>
              <NavButton to="/" className="mt-4">
                Zurück zur Startseite
              </NavButton>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    if (!accepted) {
      toast({
        title: "Bitte bestätigen Sie die Besucherrichtlinien",
        description: "Um fortzufahren, müssen Sie die Besucherrichtlinien akzeptieren",
        variant: "destructive",
      });
      return;
    }
    
    acceptPolicy(visitor.id);
    navigate(`/checkin/step3/${visitor.id}`);
  };

  return (
    <div className="app-container">
      <HomeButton />
      
      <div className="page-container">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Besucherrichtlinie</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] rounded-md border p-4 bg-white/80 backdrop-blur-sm">
              <div className="p-4 text-lg">
                <h3 className="text-xl font-bold mb-4">Besucherrichtlinie der Firma Leuka</h3>
                
                <p className="mb-4">
                  Willkommen bei der Firma Leuka. Um die Sicherheit und den Datenschutz aller Mitarbeiter und Besucher zu gewährleisten, bitten wir Sie, die folgenden Richtlinien zu beachten:
                </p>
                
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Besucher müssen sich bei Ankunft und Abreise am Empfang oder über dieses Self-Check-In-System anmelden und abmelden.</li>
                  <li>Besucher erhalten eine Besuchernummer, die während des gesamten Aufenthalts mitzuführen ist.</li>
                  <li>Besucher dürfen sich nur in Begleitung ihres Ansprechpartners oder einer autorisierten Person in den Räumlichkeiten aufhalten.</li>
                  <li>Die Verwendung von Fotografie- oder Aufnahmegeräten ist ohne ausdrückliche Genehmigung untersagt.</li>
                  <li>Vertrauliche Informationen, die während des Besuchs erlangt werden, sind streng vertraulich zu behandeln.</li>
                  <li>Im Falle eines Notfalls oder einer Evakuierung folgen Sie bitte den Anweisungen des Personals.</li>
                  <li>Bitte respektieren Sie die Arbeitsumgebung und vermeiden Sie übermäßigen Lärm oder Störungen.</li>
                  <li>Rauchen ist nur in den ausgewiesenen Bereichen gestattet.</li>
                  <li>Die Firma Leuka übernimmt keine Haftung für persönliche Gegenstände von Besuchern.</li>
                  <li>Bei Verstößen gegen diese Richtlinien behält sich die Firma Leuka das Recht vor, den Besuch zu beenden.</li>
                </ol>
                
                <p className="mt-4">
                  Durch die Bestätigung dieser Richtlinien erklären Sie, dass Sie diese gelesen und verstanden haben und sich während Ihres Besuchs daran halten werden.
                </p>
              </div>
            </ScrollArea>
            
            <div className="flex items-center space-x-2 mt-6">
              <Checkbox 
                id="accept" 
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
              />
              <Label htmlFor="accept" className="text-lg font-medium">
                Ich habe die Besucherrichtlinie gelesen und akzeptiere sie
              </Label>
            </div>
            
            <div className="pt-6 flex justify-end">
              <Button 
                onClick={handleContinue}
                className="px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
              >
                Weiter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckInStep2;
