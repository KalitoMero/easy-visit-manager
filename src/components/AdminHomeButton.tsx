
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const AdminHomeButton = () => {
  const { logout } = useAdminAuth();
  
  const handleLogout = () => {
    logout();
    console.log("Admin logged out via Home button");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute top-6 left-6 rounded-full h-12 w-12 hover:scale-105 transition-transform duration-300"
      asChild
      onClick={handleLogout}
    >
      <Link to="/">
        <Home className="h-6 w-6" />
      </Link>
    </Button>
  );
};

export default AdminHomeButton;
