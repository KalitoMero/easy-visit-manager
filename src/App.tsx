
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CheckInStep1 from "./pages/CheckInStep1";
import CheckInStep2 from "./pages/CheckInStep2";
import CheckInStep3 from "./pages/CheckInStep3";
import CheckOut from "./pages/CheckOut";
import CheckOutSuccess from "./pages/CheckOutSuccess";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import BadgePrintPreview from "./pages/BadgePrintPreview";

// Create a single QueryClient instance for the whole app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent refetching on focus to improve persistence
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/checkin/step1" element={<CheckInStep1 />} />
          <Route path="/checkin/step2/:id" element={<CheckInStep2 />} />
          <Route path="/checkin/step3/:id" element={<CheckInStep3 />} />
          <Route path="/checkout" element={<CheckOut />} />
          <Route path="/checkout/success" element={<CheckOutSuccess />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/print-badge/:id" element={<BadgePrintPreview />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
