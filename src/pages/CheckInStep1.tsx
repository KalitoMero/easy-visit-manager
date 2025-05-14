
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import NavButton from '@/components/NavButton';
import HomeButton from '@/components/HomeButton';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTranslation } from '@/locale/translations';
import { UserPlus, X, Plus } from 'lucide-react';

// Define form schema
const visitorFormSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required."
  }),
  company: z.string().min(1, {
    message: "Company is required."
  }),
  contact: z.string().min(1, {
    message: "Contact is required."
  }),
});

// Schema für zusätzliche Besucher
const additionalVisitorSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required."
  })
});

type VisitorFormValues = z.infer<typeof visitorFormSchema>;

// Erweiterte Formularwerte mit zusätzlichen Besuchern
interface ExtendedVisitorFormValues extends VisitorFormValues {
  additionalVisitors: { name: string }[];
}

const CheckInStep1: React.FC = () => {
  const navigate = useNavigate();
  const addGroupVisitor = useVisitorStore((state) => state.addGroupVisitor);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  
  // Zustand für zusätzliche Besucher
  const [additionalVisitors, setAdditionalVisitors] = useState<{ name: string }[]>([]);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<VisitorFormValues>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      name: "",
      company: "",
      contact: ""
    },
  });

  // Funktion zum Hinzufügen eines zusätzlichen Besuchers
  const addAdditionalVisitor = () => {
    setAdditionalVisitors([...additionalVisitors, { name: "" }]);
  };

  // Funktion zum Entfernen eines zusätzlichen Besuchers
  const removeAdditionalVisitor = (index: number) => {
    const updatedVisitors = [...additionalVisitors];
    updatedVisitors.splice(index, 1);
    setAdditionalVisitors(updatedVisitors);
  };

  // Funktion zum Aktualisieren des Namens eines zusätzlichen Besuchers
  const updateAdditionalVisitorName = (index: number, name: string) => {
    const updatedVisitors = [...additionalVisitors];
    updatedVisitors[index].name = name;
    setAdditionalVisitors(updatedVisitors);
  };

  // Handle form submission
  const onSubmit = (values: VisitorFormValues) => {
    setIsSubmitting(true);

    try {
      // Überprüfe, ob alle zusätzlichen Besucher gültige Namen haben
      const validAdditionalVisitors = additionalVisitors.filter(visitor => visitor.name.trim() !== "");
      
      // Erstelle die Liste aller Besucher (Hauptbesucher + zusätzliche)
      const allVisitors = [
        { name: values.name },
        ...validAdditionalVisitors
      ];
      
      // Verwende die bestehende Funktion addGroupVisitor für die Gruppenfunktionalität
      const visitor = addGroupVisitor(allVisitors, values.company, values.contact);
      
      // Navigate to next step
      navigate(`/checkin/step2/${visitor.id}`);
    } catch (error) {
      console.error("Error during check-in:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <HomeButton />
      
      <div className="page-container">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {t('selfCheckInTitle')}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">
                        {t('lastName')} 
                        <span className="text-sm text-muted-foreground ml-2">
                          ({language === 'de' ? 'Herr / Frau' : 'Mr. / Mrs.'})
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          autoFocus
                          placeholder={t('lastName')} 
                          {...field} 
                          className="text-lg h-12" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Zusätzliche Besucher */}
                {additionalVisitors.map((visitor, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-1">
                      <FormLabel className="text-lg mb-2 block">
                        {t('additionalVisitor')} {index + 1}
                      </FormLabel>
                      <div className="flex gap-2">
                        <Input
                          value={visitor.name}
                          onChange={(e) => updateAdditionalVisitorName(index, e.target.value)}
                          placeholder={t('lastName')}
                          className="text-lg h-12 flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeAdditionalVisitor(index)}
                          className="h-12 w-12"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Button zum Hinzufügen weiterer Besucher */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAdditionalVisitor}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('addVisitor')}
                </Button>
                
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">{t('company')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('company')} 
                          {...field} 
                          className="text-lg h-12" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">{t('contact')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('contact')} 
                          {...field} 
                          className="text-lg h-12" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full py-6 text-xl mt-6" 
                  disabled={isSubmitting}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  {t('continueToPolicy')}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <NavButton to="/" variant="outline">
              {t('backToHome')}
            </NavButton>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CheckInStep1;
