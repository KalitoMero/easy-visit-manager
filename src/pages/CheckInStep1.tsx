
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
import { Plus, X, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const CheckInStep1 = () => {
  const [name, setName] = useState('');
  const [additionalVisitors, setAdditionalVisitors] = useState<string[]>([]);
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const addVisitor = useVisitorStore(state => state.addVisitor);
  const addGroupVisitor = useVisitorStore(state => state.addGroupVisitor);
  const isMobile = useIsMobile();
  
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
    
    // Filter out empty names
    const validAdditionalVisitors = additionalVisitors.filter(v => v.trim());
    
    // If there are additional visitors, register as a group
    if (validAdditionalVisitors.length > 0) {
      const allNames = [name, ...validAdditionalVisitors];
      const visitor = addGroupVisitor(allNames, company, contact);
      navigate(`/checkin/step2/${visitor.id}`);
    } else {
      // Register as a single visitor
      const visitor = addVisitor(name, company, contact);
      navigate(`/checkin/step2/${visitor.id}`);
    }
  };

  const addVisitorField = () => {
    setAdditionalVisitors([...additionalVisitors, '']);
  };

  const updateAdditionalVisitor = (index: number, value: string) => {
    const updated = [...additionalVisitors];
    updated[index] = value;
    setAdditionalVisitors(updated);
  };

  const removeAdditionalVisitor = (index: number) => {
    const updated = [...additionalVisitors];
    updated.splice(index, 1);
    setAdditionalVisitors(updated);
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
                  autoComplete="name"
                  inputMode="text"
                />
              </div>
              
              {/* Additional visitors */}
              {additionalVisitors.map((visitor, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`additional-visitor-${index}`} className="text-lg block mb-2">
                      {t('additionalVisitor')}
                    </Label>
                    <Input
                      id={`additional-visitor-${index}`}
                      value={visitor}
                      onChange={(e) => updateAdditionalVisitor(index, e.target.value)}
                      className="h-14 text-lg bg-white/80 backdrop-blur-sm"
                      placeholder={t('fullName')}
                      autoComplete="name"
                      inputMode="text"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => removeAdditionalVisitor(index)}
                    className="mt-8"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ))}
              
              <div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addVisitorField}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  {t('addVisitor')}
                </Button>
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
                  autoComplete="organization"
                  inputMode="text"
                />
              </div>
              
              <div>
                <Label htmlFor="contact" className="text-lg block mb-2">
                  {t('contactPerson')}
                </Label>
                <Input
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="h-14 text-lg bg-white/80 backdrop-blur-sm"
                  placeholder={t('contactPerson')}
                  autoComplete="off"
                  inputMode="text"
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
