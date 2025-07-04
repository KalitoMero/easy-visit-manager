import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { useToast } from "@/hooks/use-toast";
import HomeButton from "@/components/HomeButton";
import { Plus, Minus, UserPlus } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { translations } from '@/locale/translations';
import { generateUUID } from '@/utils/uuid';
interface VisitorEntry {
  id: string;
  name: string;
  firstName: string;
}
const CheckInStep1 = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    language
  } = useLanguageStore();
  const t = translations[language];
  const addVisitor = useVisitorStore(state => state.addVisitor);
  const addGroupVisitor = useVisitorStore(state => state.addGroupVisitor);
  const [visitors, setVisitors] = useState<VisitorEntry[]>([{
    id: generateUUID(),
    name: '',
    firstName: ''
  }]);
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateVisitor = (id: string, field: 'name' | 'firstName', value: string) => {
    setVisitors(prev => prev.map(visitor => visitor.id === id ? {
      ...visitor,
      [field]: value
    } : visitor));
  };
  const addVisitorEntry = () => {
    setVisitors(prev => [...prev, {
      id: generateUUID(),
      name: '',
      firstName: ''
    }]);
  };
  const removeVisitor = (id: string) => {
    if (visitors.length > 1) {
      setVisitors(prev => prev.filter(visitor => visitor.id !== id));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Validate that at least the first visitor has required data
      const validVisitors = visitors.filter(v => v.name.trim() && v.firstName.trim());
      if (validVisitors.length === 0) {
        toast({
          title: t.error || "Fehler",
          description: "Bitte geben Sie mindestens einen Namen ein.",
          variant: "destructive"
        });
        return;
      }
      if (!company.trim()) {
        toast({
          title: t.error || "Fehler",
          description: "Bitte geben Sie eine Firma ein.",
          variant: "destructive"
        });
        return;
      }
      if (!contact.trim()) {
        toast({
          title: t.error || "Fehler",
          description: "Bitte geben Sie einen Ansprechpartner ein.",
          variant: "destructive"
        });
        return;
      }
      let newVisitor;
      if (validVisitors.length === 1) {
        // Single visitor
        const visitor = validVisitors[0];
        newVisitor = await addVisitor(visitor.firstName, visitor.name, company, contact);
      } else {
        // Group visitor
        const visitorData = validVisitors.map(v => ({
          name: v.name,
          firstName: v.firstName
        }));
        newVisitor = await addGroupVisitor(visitorData, company, contact);
      }
      toast({
        title: t.success || "Erfolg",
        description: `${t.visitor || "Besucher"} erfolgreich angemeldet.`
      });
      navigate(`/checkin/step2/${newVisitor.id}`);
    } catch (error) {
      console.error('Error creating visitor:', error);
      toast({
        title: t.error || "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="app-container">
      <HomeButton />
      
      {/* Language switcher positioned at top right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="page-container max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t.checkIn || "Anmeldung"}</CardTitle>
            <CardDescription>
              {t.checkInDescription || "Bitte geben Sie Ihre Daten für die Anmeldung ein"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">
                    {t.visitors || "Besucher"}
                  </Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVisitorEntry} className="flex items-center gap-2 hidden">
                    <Plus className="h-4 w-4" />
                    {t.addVisitor || "Besucher hinzufügen"}
                  </Button>
                </div>
                
                {visitors.map((visitor, index) => <div key={visitor.id} className="rounded-lg p-4 space-y-0 px-0 py-[3px]">
                    <div className="flex justify-between items-center">
                      {visitors.length > 1 && index > 0 && <Button type="button" variant="ghost" size="sm" onClick={() => removeVisitor(visitor.id)} className="text-red-600 hover:text-red-700 ml-auto">
                          <Minus className="h-4 w-4" />
                        </Button>}
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`firstName-${visitor.id}`}>
                          {t.firstName || "Vorname"} *
                        </Label>
                        <Input id={`firstName-${visitor.id}`} value={visitor.firstName} onChange={e => updateVisitor(visitor.id, 'firstName', e.target.value)} placeholder={t.enterFirstName || "Vorname eingeben"} required={index === 0} />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`name-${visitor.id}`}>
                          {t.lastName || "Nachname"} *
                        </Label>
                        <Input id={`name-${visitor.id}`} value={visitor.name} onChange={e => updateVisitor(visitor.id, 'name', e.target.value)} placeholder={t.enterLastName || "Nachname eingeben"} required={index === 0} />
                      </div>
                    </div>
                  </div>)}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">{t.company || "Firma"} *</Label>
                  <Input id="company" value={company} onChange={e => setCompany(e.target.value)} placeholder={t.enterCompany || "Firma eingeben"} required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact">{t.contact || "Ansprechpartner"} *</Label>
                <Input id="contact" value={contact} onChange={e => setContact(e.target.value)} placeholder={t.enterContact || "Name des Ansprechpartners"} required />
              </div>
              
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                <UserPlus className="mr-2 h-5 w-5" />
                {isSubmitting ? t.processing || "Wird verarbeitet..." : t.continue || "Weiter"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default CheckInStep1;