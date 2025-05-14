
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';
import { useToast } from '@/hooks/use-toast';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTranslation } from '@/locale/translations';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const CheckInStep1 = () => {
  const [salutation, setSalutation] = useState<string>('');
  const [name, setName] = useState('');
  const [additionalVisitors, setAdditionalVisitors] = useState<Array<{ salutation: string, name: string }>>([]);
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
    const validAdditionalVisitors = additionalVisitors.filter(v => v.name.trim());
    
    // If there are additional visitors, register as a group
    if (validAdditionalVisitors.length > 0) {
      const allVisitors = [{ salutation, name }, ...validAdditionalVisitors];
      const visitor = addGroupVisitor(allVisitors, company, contact);
      navigate(`/checkin/step2/${visitor.id}`);
    } else {
      // Register as a single visitor
      const visitor = addVisitor(name, company, contact, salutation);
      navigate(`/checkin/step2/${visitor.id}`);
    }
  };

  const addVisitorField = () => {
    setAdditionalVisitors([...additionalVisitors, { salutation: '', name: '' }]);
  };

  const updateAdditionalVisitor = (index: number, field: 'salutation' | 'name', value: string) => {
    const updated = [...additionalVisitors];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalVisitors(updated);
  };

  const removeAdditionalVisitor = (index: number) => {
    const updated = [...additionalVisitors];
    updated.splice(index, 1);
    setAdditionalVisitors(updated);
  };

  const salutationOptions = [
    { value: "Mr.", label: "Mr." },
    { value: "Mrs.", label: "Mrs." },
    { value: "Mx.", label: "Mx." }
  ];

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
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Select value={salutation} onValueChange={setSalutation}>
                      <SelectTrigger id="salutation">
                        <SelectValue placeholder="Anrede" />
                      </SelectTrigger>
                      <SelectContent>
                        {salutationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
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
                </div>
              </div>
              
              {/* Additional visitors */}
              {additionalVisitors.map((visitor, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`additional-visitor-${index}`} className="text-lg block mb-2">
                      {t('additionalVisitor')}
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <Select 
                          value={visitor.salutation} 
                          onValueChange={(value) => updateAdditionalVisitor(index, 'salutation', value)}
                        >
                          <SelectTrigger id={`salutation-${index}`}>
                            <SelectValue placeholder="Anrede" />
                          </SelectTrigger>
                          <SelectContent>
                            {salutationOptions.map((option) => (
                              <SelectItem key={`${index}-${option.value}`} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Input
                          id={`additional-visitor-${index}`}
                          value={visitor.name}
                          onChange={(e) => updateAdditionalVisitor(index, 'name', e.target.value)}
                          className="h-14 text-lg bg-white/80 backdrop-blur-sm"
                          placeholder={t('fullName')}
                          autoComplete="name"
                          inputMode="text"
                        />
                      </div>
                    </div>
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
