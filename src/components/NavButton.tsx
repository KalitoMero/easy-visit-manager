
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
  type?: "button" | "submit" | "reset";
}

const NavButton = ({
  to,
  position = 'center',
  onClick,
  variant = 'default',
  className,
  children,
  type = "button",
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
      type={type}
    >
      <Link to={to}>{children}</Link>
    </Button>
  );
};

export default NavButton;
