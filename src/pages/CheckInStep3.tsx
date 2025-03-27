
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NavButton from '@/components/NavButton';
import HomeButton from '@/components/HomeButton';
import { useVisitorStore } from '@/hooks/useVisitorStore';

const CheckInStep3 = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const visitors = useVisitorStore(state => state.visitors);
  
  // Find the current visitor
  const visitor = visitors.find(v => v.id === id);
  
  useEffect(() => {
    if (!visitor || !visitor.policyAccepted) {
      navigate('/');
    }
  }, [visitor, navigate]);
  
  if (!visitor) {
    return null;
  }

  return (
    <div className="app-container">
      <HomeButton />
      
      <div className="page-container">
        <Card className="border-0 shadow-none bg-transparent text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Anmeldung erfolgreich</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="py-8">
              <p className="text-xl mb-8">
                Ihre Besuchernummer lautet:
              </p>
              <div className="text-7xl font-bold text-primary py-4">
                {visitor.visitorNumber}
              </div>
              <p className="text-xl mt-8">
                Bitte notieren Sie diese Nummer, um sich später abmelden zu können.
              </p>
            </div>
            
            <Card className="bg-primary/10 border-primary/30 p-4">
              <p className="text-lg">
                Ihr Ansprechpartner <strong>{visitor.contact}</strong> wurde über Ihre Ankunft informiert.
              </p>
            </Card>
            
            <div className="pt-6">
              <NavButton to="/" position="center">
                Zurück zur Startseite
              </NavButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CheckInStep3;
