
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
import useTranslation from '@/locale/translations';
import { UserPlus, X, Plus } from 'lucide-react';

// Define form schema
const visitorFormSchema = z.object({
  firstName: z.string().min(1, {
    message: "First name is required."
  }),
  name: z.string().min(1, {
    message: "Last name is required."
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
  firstName: z.string().min(1, {
    message: "First name is required."
  }),
  name: z.string().min(1, {
    message: "Last name is required."
  })
});

type VisitorFormValues = z.infer<typeof visitorFormSchema>;

// Erweiterte Formularwerte mit zusätzlichen Besuchern
interface ExtendedVisitorFormValues extends VisitorFormValues {
  additionalVisitors: { firstName: string, name: string }[];
}

const CheckInStep1: React.FC = () => {
  const navigate = useNavigate();
  const addGroupVisitor = useVisitorStore((state) => state.addGroupVisitor);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  
  // Zustand für zusätzliche Besucher
  const [additionalVisitors, setAdditionalVisitors] = useState<{ firstName: string, name: string }[]>([]);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<VisitorFormValues>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      firstName: "",
      name: "",
      company: "",
      contact: ""
    },
  });

  // Funktion zum Hinzufügen eines zusätzlichen Besuchers
  const addAdditionalVisitor = () => {
    setAdditionalVisitors([...additionalVisitors, { firstName: "", name: "" }]);
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

  // Funktion zum Aktualisieren des Vornamens eines zusätzlichen Besuchers
  const updateAdditionalVisitorFirstName = (index: number, firstName: string) => {
    const updatedVisitors = [...additionalVisitors];
    updatedVisitors[index].firstName = firstName;
    setAdditionalVisitors(updatedVisitors);
  };

  // Handle form submission
  const onSubmit = (values: VisitorFormValues) => {
    setIsSubmitting(true);

    try {
      // Überprüfe, ob alle zusätzlichen Besucher gültige Namen haben
      const validAdditionalVisitors = additionalVisitors.filter(visitor => 
        visitor.name.trim() !== "" && visitor.firstName.trim() !== ""
      );
      
      // Erstelle die Liste aller Besucher (Hauptbesucher + zusätzliche)
      const allVisitors = [
        { firstName: values.firstName, name: values.name },
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
        {/* Make form 20% wider with w-[120%] class */}
        <Card className="mx-auto max-w-3xl w-[120%]">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {t('selfCheckInTitle')}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Add Additional Visitor Button */}
                <div className="flex justify-end mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAdditionalVisitor}
                    className="text-sm flex items-center gap-1"
                  >
                    <UserPlus className="h-4 w-4" />
                    {language === 'de' ? 'Weitere Person mitanmelden' : 'Register additional person'}
                  </Button>
                </div>
                
                {/* Two column layout for first name and last name */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* First name field - half width */}
                  <div className="md:w-1/2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">{t('firstName')}</FormLabel>
                          <FormControl>
                            <Input 
                              autoFocus
                              placeholder={t('firstName')} 
                              {...field} 
                              className="text-lg h-12" 
                              autoComplete="off"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Last name field - half width */}
                  <div className="md:w-1/2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">
                            {t('lastName')} 
                            <span className="text-sm text-muted-foreground ml-2">
                              ({language === 'de' ? 'Herr / Frau / Div' : 'Mr. / Mrs. / Div'})
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('lastName')} 
                              {...field} 
                              className="text-lg h-12" 
                              autoComplete="off"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Company field - full width */}
                <div>
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
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Zusätzliche Besucher */}
                {additionalVisitors.map((visitor, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-lg mb-0">
                        {t('additionalVisitor')} {index + 1}
                      </FormLabel>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeAdditionalVisitor(index)}
                        className="h-8"
                      >
                        <X className="h-4 w-4 mr-1" /> {t('remove')}
                      </Button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      {/* First name field for additional visitor */}
                      <div className="md:w-1/2">
                        <Input
                          placeholder={t('firstName')}
                          value={visitor.firstName}
                          onChange={(e) => updateAdditionalVisitorFirstName(index, e.target.value)}
                          className="text-lg h-12"
                          autoComplete="off"
                        />
                      </div>
                      
                      {/* Last name field for additional visitor */}
                      <div className="md:w-1/2">
                        <Input
                          placeholder={t('lastName')}
                          value={visitor.name}
                          onChange={(e) => updateAdditionalVisitorName(index, e.target.value)}
                          className="text-lg h-12"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Contact person field */}
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
                          autoComplete="off"
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
