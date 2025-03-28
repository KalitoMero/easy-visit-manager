
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
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAwIDYwMCI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjMDAyNDdkIi8+PHBhdGggZD0iTTAsMAw2MDAsNDAwTDAsMGwwLDYwMGw2MDAtNDAwbC02MDAsNDAwSjEyMDBWMEwwLDB6IiBmaWxsPSIjQ0YxNDJCIi8+PHBhdGggZD0iTTAsMA0KICAgICAgICAgTDEyMDAsNjAwLDEyMDAsMFoiIGZpbGw9IiNDRjE0MkIiLz48cGF0aCBkPSJNMCw2MDBMMTIwMCwwLDAsMEgwenMiIGZpbGw9IiNDRjE0MkIiLz48cGF0aCBkPSJNMCwwIEwxMjAwLDYwMCBMMTIwMCwwIEwwLDYwMCBMMCwweiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEyMCIvPjxwYXRoIGQ9Ik02MDAsMCBMNjAwLDYwMCBNMCwzMDAgTDEyMDAsMzAwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMjAwIi8+PHBhdGggZD0iTTYwMCwwIEw2MDAsNjAwIE0wLDMwMCBMMTIwMCwzMDAiIHN0cm9rZT0iI0NGMTQyQiIgc3Ryb2tlLXdpZHRoPSIxMjAiLz48L3N2Zz4=" 
          alt="English" 
          className="w-full h-full rounded-full"
        />
      </button>
    </div>
  );
};

export default LanguageSwitcher;
