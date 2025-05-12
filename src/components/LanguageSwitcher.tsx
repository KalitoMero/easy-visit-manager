
import React from 'react';
import { useLanguageStore, Language } from '@/hooks/useLanguageStore';
import { cn } from '@/lib/utils';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguageStore();

  // Flaggen-Styles beibehalten
  const flagStyles = "w-12 h-12 rounded-full border-2 transition-all duration-300 cursor-pointer";
  const activeStyle = "border-primary scale-110 shadow-md";
  const inactiveStyle = "border-muted-foreground opacity-70 hover:opacity-100";

  return (
    <div className="flex items-center space-x-6">
      <div className="flex flex-col items-center">
        <button
          onClick={() => setLanguage('de')}
          className={cn(
            flagStyles,
            language === 'de' ? activeStyle : inactiveStyle
          )}
          aria-label="Deutsch"
          title="Deutsch"
        >
          {/* Deutsche Flagge beibehalten */}
          <img 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1IDMiPjxwYXRoIGQ9Ik0wLDBoNXYxSDB6IiBmaWxsPSIjMDAwIi8+PHBhdGggZD0iTTAsMWg1djFIMHoiIGZpbGw9IiNmMDAiLz48cGF0aCBkPSJNMCwyaDV2MUgweiIgZmlsbD0iI2ZmY2UwMCIvPjwvc3ZnPg==" 
            alt="Deutsch" 
            className="w-full h-full rounded-full object-cover"
          />
        </button>
        <span className="text-sm mt-1 font-medium">Deutsch</span>
      </div>
      
      <div className="flex flex-col items-center">
        <button
          onClick={() => setLanguage('en')}
          className={cn(
            flagStyles,
            language === 'en' ? activeStyle : inactiveStyle
          )}
          aria-label="English"
          title="English"
        >
          {/* Vereinfachte englische Flagge mit einfacherem SVG-Code */}
          <img 
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDI0IDUxMiI+PHJlY3Qgd2lkdGg9IjEwMjQiIGhlaWdodD0iNTEyIiBmaWxsPSIjMDEyMTY5Ii8+PHBhdGggZD0iTTAgMGw0MDkgMjU2TC0xIDI1NiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjQwIi8+PHBhdGggZD0iTTEwMjQgMGwtNDA5IDI1NmwxLTEiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI0MCIvPjxwYXRoIGQ9Ik0wIDUxMmw0MDktMjU2IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iNDAiLz48cGF0aCBkPSJNMTAyNCA1MTJsLTQwOS0yNTYiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSI0MCIvPjxwYXRoIGQ9Ik01MTIgMCBMNTEyIDUxMiBNMCAyNTYgTDEwMjQgMjU2IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iODAiIGZpbGw9Im5vbmUiIC8+PHBhdGggZD0iTTUxMiAwIEw1MTIgNTEyIE0wIDI1NiBMMTAyNCAyNTYiIHN0cm9rZT0iI0MwMDEyQiIgc3Ryb2tlLXdpZHRoPSI0MCIgZmlsbD0ibm9uZSIgLz48L3N2Zz4=" 
            alt="English" 
            className="w-full h-full rounded-full object-cover"
          />
        </button>
        <span className="text-sm mt-1 font-medium">English</span>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
