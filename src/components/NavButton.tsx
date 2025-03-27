
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavButtonProps {
  to: string;
  position?: 'left' | 'center' | 'right';
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  className?: string;
  children: React.ReactNode;
}

const NavButton = ({
  to,
  position = 'center',
  onClick,
  variant = 'default',
  className,
  children,
}: NavButtonProps) => {
  const positionClasses = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  };

  return (
    <Button
      variant={variant}
      className={cn(
        'px-8 py-6 text-lg transition-all duration-300 hover:scale-105',
        positionClasses[position],
        className
      )}
      asChild
      onClick={onClick}
    >
      <Link to={to}>{children}</Link>
    </Button>
  );
};

export default NavButton;
