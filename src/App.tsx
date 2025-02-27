
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MergePDF from "./pages/MergePDF";
import SplitPDF from "./pages/SplitPDF";
import CompressPDF from "./pages/CompressPDF";
import PDFToImage from "./pages/PDFToImage";
import CreatePDF from "./pages/CreatePDF";
import PDFTools from "./pages/PDFTools";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pdf-tools" element={<PDFTools />} />
          <Route path="/merge-pdf" element={<MergePDF />} />
          <Route path="/split-pdf" element={<SplitPDF />} />
          <Route path="/compress-pdf" element={<CompressPDF />} />
          <Route path="/pdf-to-image" element={<PDFToImage />} />
          <Route path="/create-pdf" element={<CreatePDF />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
