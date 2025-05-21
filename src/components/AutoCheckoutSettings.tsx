
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserMinus, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const AutoCheckoutSettings = () => {
  const { toast } = useToast();
  const autoCheckoutSchedule = useVisitorStore(state => state.autoCheckoutSchedule);
  const updateAutoCheckoutSchedule = useVisitorStore(state => state.updateAutoCheckoutSchedule);
  const checkOutAllVisitors = useVisitorStore(state => state.checkOutAllVisitors);
  const activeVisitors = useVisitorStore(state => state.getActiveVisitors());

  // Local state for form
  const [enabled, setEnabled] = useState(autoCheckoutSchedule.enabled);
  const [hour, setHour] = useState(autoCheckoutSchedule.hour.toString());
  const [minute, setMinute] = useState(autoCheckoutSchedule.minute.toString());

  const handleSaveSettings = () => {
    updateAutoCheckoutSchedule(
      enabled,
      parseInt(hour),
      parseInt(minute)
    );

    toast({
      title: "Einstellungen gespeichert",
      description: `Automatische Abmeldung ${enabled ? 'aktiviert' : 'deaktiviert'} - Zeit: ${hour}:${minute} Uhr`,
    });
  };

  const handleCheckoutAllVisitors = () => {
    const count = checkOutAllVisitors();
    
    if (count > 0) {
      toast({
        title: "Alle Besucher abgemeldet",
        description: `${count} aktive Besucher wurden erfolgreich abgemeldet.`,
      });
    } else {
      toast({
        title: "Keine aktiven Besucher",
        description: "Es sind keine aktiven Besucher zum Abmelden vorhanden.",
      });
    }
  };

  // Generate hours and minutes for select options
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Besucher Abmeldesteuerung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Manual mass checkout section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Alle Besucher abmelden</h3>
            <Button 
              onClick={handleCheckoutAllVisitors}
              variant="default" 
              className="flex items-center gap-2"
              disabled={activeVisitors.length === 0}
            >
              <UserMinus className="h-4 w-4" />
              Jetzt alle abmelden ({activeVisitors.length})
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Meldet alle aktiven Besucher sofort ab. Die Besucher bleiben in der Datenbank, werden aber als abgemeldet markiert.
          </p>
        </div>

        <hr />

        {/* Automatic checkout schedule section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <h3 className="font-medium">Automatische tägliche Abmeldung</h3>
              <p className="text-sm text-muted-foreground">
                Aktivieren Sie diese Option, um alle Besucher täglich zu einer bestimmten Uhrzeit automatisch abzumelden.
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              aria-label="Automatische Abmeldung aktivieren"
            />
          </div>

          {enabled && (
            <div className="flex items-end gap-4 mt-4">
              <div className="w-full space-y-2">
                <Label htmlFor="checkout-hour">Stunde</Label>
                <Select value={hour} onValueChange={setHour}>
                  <SelectTrigger id="checkout-hour">
                    <SelectValue placeholder="Stunde wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((h) => (
                      <SelectItem key={`hour-${h}`} value={h.toString()}>
                        {h.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full space-y-2">
                <Label htmlFor="checkout-minute">Minute</Label>
                <Select value={minute} onValueChange={setMinute}>
                  <SelectTrigger id="checkout-minute">
                    <SelectValue placeholder="Minute wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((m) => (
                      <SelectItem key={`minute-${m}`} value={m.toString()}>
                        {m.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleSaveSettings}
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Speichern
              </Button>
            </div>
          )}

          {enabled && (
            <div className="text-sm bg-muted/50 p-3 rounded-md">
              <p>
                <strong>Aktuelle Einstellung: </strong>
                Automatische Abmeldung täglich um {hour.padStart(2, '0')}:{minute.padStart(2, '0')} Uhr
              </p>
              {autoCheckoutSchedule.lastRun && (
                <p className="text-xs text-muted-foreground mt-2">
                  Letzte automatische Abmeldung: {new Date(autoCheckoutSchedule.lastRun).toLocaleString('de-DE')}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoCheckoutSettings;
