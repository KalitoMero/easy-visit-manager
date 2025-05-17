
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import pdfMake to ensure it's available globally
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';

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
    pdfMake?: typeof pdfMake;
  }
}

// Make sure pdfMake is available globally
if (typeof window !== 'undefined') {
  window.pdfMake = pdfMake;
}

createRoot(document.getElementById("root")!).render(<App />);
