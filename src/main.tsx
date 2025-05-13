
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// TypeScript declarations for Electron
declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      getPrinters: () => Promise<any[]>;
      printBadge: (visitorData: any) => Promise<{success: boolean, message?: string}>;
      getStoreData: (storeName: string) => Promise<any>;
      setStoreData: (storeName: string, key: string, data: any) => Promise<boolean>;
      exportVisitors: () => Promise<{success: boolean, path?: string, message?: string}>;
      importVisitors: () => Promise<{success: boolean, visitors?: any[], message?: string}>;
      getVersion: () => string;
    };
  }
}

createRoot(document.getElementById("root")!).render(<App />);
