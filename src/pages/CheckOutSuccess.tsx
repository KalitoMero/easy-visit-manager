
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NavButton from '@/components/NavButton';
import HomeButton from '@/components/HomeButton';

const CheckOutSuccess = () => {
  return (
    <div className="app-container">
      <HomeButton />
      
      <div className="page-container">
        <Card className="border-0 shadow-none bg-transparent text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Erfolgreich abgemeldet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="py-12">
              <p className="text-2xl mb-4">
                Danke für Ihren Besuch bei der Leuka GmbH.
              </p>
              <p className="text-2xl text-primary">
                Wir wünschen Ihnen eine gute Heimreise!
              </p>
            </div>
            
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

export default CheckOutSuccess;
