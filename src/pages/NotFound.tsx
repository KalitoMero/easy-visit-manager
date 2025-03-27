
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import NavButton from "@/components/NavButton";

const NotFound = () => {
  const location = useLocation();

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
          Die angeforderte Seite wurde nicht gefunden
        </p>
        <NavButton to="/">
          Zurück zur Startseite
        </NavButton>
      </div>
    </div>
  );
};

export default NotFound;
