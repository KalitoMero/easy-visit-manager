import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import NavButton from "@/components/NavButton";
import { useLanguageStore } from '@/hooks/useLanguageStore';
import useTranslation from '@/locale/translations';

const NotFound = () => {
  const location = useLocation();
  const { language } = useLanguageStore();
  const t = useTranslation(language);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="app-container">
      <div className="page-container max-w-lg text-center">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          {t('pageNotFound')}
        </p>
        <NavButton to="/">
          {t('backToHomeButton')}
        </NavButton>
      </div>
    </div>
  );
};

export default NotFound;
