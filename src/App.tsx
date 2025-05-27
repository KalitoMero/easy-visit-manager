
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useEffect } from 'react';

// Pages
import Index from '@/pages/Index';
import CheckInStep1 from '@/pages/CheckInStep1';
import CheckInStep2 from '@/pages/CheckInStep2';
import CheckInStep3 from '@/pages/CheckInStep3';
import BadgePrintPreview from '@/pages/BadgePrintPreview';
import CheckOut from '@/pages/CheckOut';
import CheckOutSuccess from '@/pages/CheckOutSuccess';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';

// Initialization
import { initializeApp } from '@/lib/appInitializer';
import { initializeAutoCheckout } from '@/hooks/useVisitorStore';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  useEffect(() => {
    // Initialize the application
    initializeApp();
    
    // Initialize auto checkout
    const cleanup = initializeAutoCheckout();
    
    return cleanup;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/checkin/step1" element={<CheckInStep1 />} />
            <Route path="/checkin/step2/:id" element={<CheckInStep2 />} />
            <Route path="/checkin/step3/:id" element={<CheckInStep3 />} />
            <Route path="/print-badge/:id" element={<BadgePrintPreview />} />
            <Route path="/checkout" element={<CheckOut />} />
            <Route path="/checkout/success/:id" element={<CheckOutSuccess />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
