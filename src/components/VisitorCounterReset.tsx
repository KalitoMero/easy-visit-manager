
import React, { useState } from 'react';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

// Standard-Besucherzähler-Wert
const DEFAULT_VISITOR_COUNTER = 100;

const VisitorCounterReset = () => {
  const visitorCounter = useVisitorStore(state => state.visitorCounter);
  const resetVisitorCounter = useVisitorStore(state => state.resetVisitorCounter);
  const [newCounter, setNewCounter] = useState(visitorCounter.toString());

  const handleReset = () => {
    const counterValue = parseInt(newCounter, 10);
    if (isNaN(counterValue) || counterValue < 1) {
      toast({
        title: "Ungültiger Wert",
        description: "Bitte geben Sie eine positive Zahl ein.",
        variant: "destructive"
      });
      return;
    }

    resetVisitorCounter(counterValue);
    toast({
      title: "Besucherzähler zurückgesetzt",
      description: `Der Besucherzähler wurde auf ${counterValue} gesetzt.`,
    });
  };

  const handleResetToDefault = () => {
    resetVisitorCounter(DEFAULT_VISITOR_COUNTER);
    setNewCounter(DEFAULT_VISITOR_COUNTER.toString());
    toast({
      title: "Besucherzähler zurückgesetzt",
      description: `Der Besucherzähler wurde auf den Standardwert ${DEFAULT_VISITOR_COUNTER} gesetzt.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Besuchernummer-Einstellungen</CardTitle>
        <CardDescription>Besuchernummern-Zähler zurücksetzen oder anpassen</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentCounter">Aktueller Zählerstand</Label>
            <div className="text-xl font-medium">{visitorCounter}</div>
            <div className="text-sm text-muted-foreground">
              Dies ist die Nummer, die dem nächsten Besucher zugewiesen wird.
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newCounter">Neuer Zählerstand</Label>
            <div className="flex space-x-2">
              <Input
                id="newCounter"
                value={newCounter}
                onChange={(e) => setNewCounter(e.target.value)}
                type="number"
                min="1"
              />
              <Button 
                onClick={handleReset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Setzen
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Standardwert ist {DEFAULT_VISITOR_COUNTER}. Bei Zurücksetzen wird diese Nummer für den nächsten Besucher verwendet.
            </div>
            
            <Button 
              onClick={handleResetToDefault}
              variant="secondary"
              size="sm"
              className="mt-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Auf Standardwert {DEFAULT_VISITOR_COUNTER} zurücksetzen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitorCounterReset;
