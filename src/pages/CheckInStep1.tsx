
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { useToast } from '@/hooks/use-toast';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTranslation } from '@/locale/translations';

const CheckInStep1 = () => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const addVisitor = useVisitorStore(state => state.addVisitor);
  
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: t('nameRequired'),
        description: t('nameRequired'),
        variant: "destructive",
      });
      return;
    }
    
    if (!company.trim()) {
      toast({
        title: t('companyRequired'),
        description: t('companyRequired'),
        variant: "destructive",
      });
      return;
    }
    
    if (!contact.trim()) {
      toast({
        title: t('contactRequired'),
        description: t('contactRequired'),
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
            <CardTitle className="text-3xl font-bold">{t('visitorRegistration')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-lg block mb-2">
                  {t('name')}
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 text-lg bg-white/80 backdrop-blur-sm"
                  placeholder={t('fullName')}
                  autoFocus
                  autoComplete="off"
                />
              </div>
              
              <div>
                <Label htmlFor="company" className="text-lg block mb-2">
                  {t('company')}
                </Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="h-14 text-lg bg-white/80 backdrop-blur-sm"
                  placeholder={t('company')}
                  autoComplete="off"
                />
              </div>
              
              <div>
                <Label htmlFor="contact" className="text-lg block mb-2">
                  {t('contact')}
                </Label>
                <Input
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="h-14 text-lg bg-white/80 backdrop-blur-sm"
                  placeholder={t('contact')}
                  autoComplete="off"
                />
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button type="submit" className="px-8 py-6 text-lg transition-all duration-300 hover:scale-105">
                  {t('next')}
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
