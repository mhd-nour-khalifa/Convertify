
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CounterProvider } from "./context/CounterContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MergePDF from "./pages/MergePDF";
import SplitPDF from "./pages/SplitPDF";
import CompressPDF from "./pages/CompressPDF";
import PDFToImage from "./pages/PDFToImage";
import CreatePDF from "./pages/CreatePDF";
import PDFTools from "./pages/PDFTools";
import Pricing from "./pages/Pricing";
import PDFToText from "./pages/PDFToText";
import ProtectPDF from "./pages/ProtectPDF";
import UnlockPDF from "./pages/UnlockPDF";
import RotatePDF from "./pages/RotatePDF";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CounterProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" closeButton />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pdf-tools" element={<PDFTools />} />
            <Route path="/merge-pdf" element={<MergePDF />} />
            <Route path="/split-pdf" element={<SplitPDF />} />
            <Route path="/compress-pdf" element={<CompressPDF />} />
            <Route path="/pdf-to-image" element={<PDFToImage />} />
            <Route path="/pdf-to-text" element={<PDFToText />} />
            <Route path="/create-pdf" element={<CreatePDF />} />
            <Route path="/protect-pdf" element={<ProtectPDF />} />
            <Route path="/unlock-pdf" element={<UnlockPDF />} />
            <Route path="/rotate-pdf" element={<RotatePDF />} />
            <Route path="/pricing" element={<Pricing />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CounterProvider>
  </QueryClientProvider>
);

export default App;
