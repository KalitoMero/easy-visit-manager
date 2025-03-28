
import React from 'react';
import { useLanguageStore, Language } from '@/hooks/useLanguageStore';
import { cn } from '@/lib/utils';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguageStore();

  const flagStyles = "w-8 h-8 rounded-full border-2 transition-all duration-300 cursor-pointer";
  const activeStyle = "border-primary scale-110 shadow-md";
  const inactiveStyle = "border-muted-foreground opacity-70 hover:opacity-100";

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLanguage('de')}
        className={cn(
          flagStyles,
          language === 'de' ? activeStyle : inactiveStyle
        )}
        aria-label="Deutsch"
        title="Deutsch"
      >
        <img 
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDMiPjxwYXRoIGQ9Ik0wLDBoNXYxSDB6IiBmaWxsPSIjMDAwIi8+PHBhdGggZD0iTTAsMWg1djFIMHoiIGZpbGw9IiNmMDAiLz48cGF0aCBkPSJNMCwyaDV2MUgweiIgZmlsbD0iI2ZmY2UwMCIvPjwvc3ZnPg==" 
          alt="Deutsch" 
          className="w-full h-full rounded-full"
        />
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          flagStyles,
          language === 'en' ? activeStyle : inactiveStyle
        )}
        aria-label="English"
        title="English"
      >
        <img 
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAwIDYwMCIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxwYXRoIGlkPSJhIiBkPSJNMCAwaDYwMHY2MDBIMHoiLz48cGF0aCBpZD0iYiIgZD0iTTAgMGwyMDAgNTUwaC01MEwwIDBsMTUwIDU1MGg1MHoiLz48cGF0aCBpZD0iYyIgZD0iTTAgMGw2MDAgNDQwSDB6Ii8+PHBhdGggaWQ9ImQiIGQ9Ik0wIDYwbDYwMCA0NDBoLTYwMHoiLz48cGF0aCBpZD0iZSIgZD0iTTAgMGwzMDAgNTUwSDB6Ii8+PHBhdGggaWQ9ImYiIGQ9Ik0zMDAgMGwzMDAgNTUwSDMwMHoiLz48cGF0aCBpZD0iZyIgZD0iTTAgNTUwbDMwMC01NTBoLTYwbC0yNDAgNTUweiIvPjxwYXRoIGlkPSJoIiBkPSJNNjAgMGwyNDAgNTUwSDM2MFpiIi8+PHBhdGggaWQ9ImkiIGQ9Ik0wIDBoNjB2NTUwSDB6Ii8+PHBhdGggaWQ9ImoiIGQ9Ik0yNDAgMGg2MHY1NTBoLTYweiIvPjxwYXRoIGlkPSJrIiBkPSJNMCAyNDBoNjAwdjYwSDB6Ii8+PHBhdGggaWQ9ImwiIGQ9Ik0wIDE4MGg2MDB2MTgwSDB6Ii8+PC9kZWZzPjxjbGlwUGF0aCBpZD0ibSI+PHVzZSB4bGluazpocmVmPSIjYSIvPjwvY2xpcFBhdGg+PHBhdGggZmlsbD0iIzAxMjE2OSIgZD0iTTAgMGgxMjAwdjYwMEgweiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDBoMjAwdjU1MEgwek00MDAgMGgyMDB2NTUwSDQwMHpNMCAyMDBoNjAwdjE1MEgweiIvPjxwYXRoIGZpbGw9IiNjODEwMmUiIGQ9Ik0wIDI0MGg2MDB2NzBIMHpNMjQwIDBINjB2NTUwaDM2MFY1NTBsLTI0MC01NTBoLTYwbDI0MCA1NTBoLTYwVjB6Ii8+PHBhdGggZmlsbD0iI2ZmZiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNjAwKSIgZD0iTTAgMGg2MDB2NjAwSDB6Ii8+PHBhdGggZmlsbD0iI2M4MTAyZSIgZD0iTTYwMCAyNDBoNjAwdjEyMEg2MDB6TTkwMCAwaDEyMHY2MDBIOTN6Ii8+PC9zdmc+" 
          alt="English" 
          className="w-full h-full rounded-full"
        />
      </button>
    </div>
  );
};

export default LanguageSwitcher;

