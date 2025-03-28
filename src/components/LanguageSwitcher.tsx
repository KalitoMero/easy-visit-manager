
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
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjM1IDY1MCIgaGVpZ2h0PSIyNSIgd2lkdGg9IjQ4Ij48cmVjdCBmaWxsPSIjMDAyNDdkIiBoZWlnaHQ9IjY1MCIgd2lkdGg9IjEyMzUiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJtMCwwIDE0NC4yNjYsODEuNSA1OTMuMzE4LDMzNS41LTU5My4zMTgsMjMxLjUtMTQ0LjI2Niw2Ii8+PHBhdGggZmlsbD0iI2ZmZiIgZD0ibTEyMzUsNjUwLTE0NC4yNjYtNzUuNS01OTMuMzE4LTMzNi41IDU5My4zMTgtMjMyLjUgMTQ0LjI2NiwtNSIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Im02MTcuNSwyNzUgNjE3LjUsMzc1di01MGwtNTY4LjI1MSwzNTAtNDkuMjQ5LC0yNSA2MTcuNSwtNzEyLjUgMC41LDI1eiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Im02MTcuNSwzNzUgLTYxNy41LDI3NXY1MGw2MTcuNSwtMzcwIDAgMzBjMCwwIC0xLjM3Myw0NC4xOTcgMCw0NS00LjU0Miw0NC4xOTcgNjcuNSwwIDY3LjUsMGw1NTAsMzUwdi01MGwtNjE3LjUsLTMxMC41IDAuNSwtMjV6Ii8+PHBhdGggZmlsbD0iI2MwMDAyNyIgZD0ibTYxNy41LDI3NSA2MTcuNSwzNzV2LTI1bC02MTcuNSwtMzc1eiIvPjxwYXRoIGZpbGw9IiNjMDAwMjciIGQ9Im02MTcuNSwzNzUgLTYxNy41LDI3NXYyNWw2MTcuNSwtMjc1eiIvPjxwYXRoIGZpbGw9IiNjMDAwMjciIGQ9Im0yNjYuNSwwIDM1MSwzMDBjMC41LDE0LjE2NyAwLDUwIDAsMCBsLTM1MS4wMDEsLTMwMCIvPjxwYXRoIGZpbGw9IiNjMDAwMjciIGQ9Im0yNjYuNSw2NTAgMzUxLC0zMDBjMC41LC0xNC4xNjcgMCwtNTAgMCwwIGwtMzUxLjAwMSwzMDAiLz48cGF0aCBmaWxsPSIjYzAwMDI3IiBkPSJtOTY4LjUsMCAtMzUxLjAwMSwzMDBjLTAuNSwxNC4xNjcgMCw1MCAwLDAgbDM1MS4wMDEsLTMwMCIvPjxwYXRoIGZpbGw9IiNjMDAwMjciIGQ9Im05NjguNSw2NTAgLTM1MS4wMDEsLTMwMGMtMC41LC0xNC4xNjcgMCwtNTAgMCwwIGwzNTEuMDAxLDMwMCIvPjxyZWN0IGZpbGw9IiNjMDAwMjciIGhlaWdodD0iMTMwIiB3aWR0aD0iMTIzNSIgeT0iMjYwIi8+PHJlY3QgZmlsbD0iI2MwMDAyNyIgaGVpZ2h0PSIxMjM1IiB3aWR0aD0iMTMwIiB4PSI1NTIuNSIvPjwvc3ZnPg==" 
          alt="English" 
          className="w-full h-full rounded-full"
        />
      </button>
    </div>
  );
};

export default LanguageSwitcher;
