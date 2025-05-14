
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
import { UserPlus, Users } from 'lucide-react';

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

type VisitorFormValues = z.infer<typeof visitorFormSchema>;

const CheckInStep1: React.FC = () => {
  const navigate = useNavigate();
  const addVisitor = useVisitorStore((state) => state.addVisitor);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language } = useLanguageStore();
  const t = useTranslation(language);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<VisitorFormValues>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      name: "",
      company: "",
      contact: ""
    },
  });

  // Handle form submission
  const onSubmit = (values: VisitorFormValues) => {
    setIsSubmitting(true);

    try {
      // Add visitor to store
      const visitor = addVisitor(values.name, values.company, values.contact);
      
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
                      <div className="flex items-baseline justify-between">
                        <FormLabel className="text-lg">{t('lastName')}</FormLabel> 
                        <span className="text-sm text-muted-foreground">
                          {language === 'de' ? 'Herr / Frau' : 'Mr. / Mrs.'}
                        </span>
                      </div>
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
                
                <div className="text-center text-sm text-muted-foreground">
                  {t('orUse')}{" "}
                  <NavButton to="/checkin/group" variant="link" className="p-0 h-auto">
                    <Users className="inline-block mr-1 h-3 w-3" />
                    {t('groupCheckIn')}
                  </NavButton>
                </div>
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
