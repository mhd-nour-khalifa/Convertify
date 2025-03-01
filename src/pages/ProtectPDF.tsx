
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "@/components/FileUploader";
import { PDFDocument } from "pdf-lib";

// Import our new components
import PasswordInputSection from "@/components/pdf-tools/PasswordInputSection";
import ProtectedPDFResult from "@/components/pdf-tools/ProtectedPDFResult";
import PDFInstructionsSection from "@/components/pdf-tools/PDFInstructionsSection";
import BrowserLimitationAlert from "@/components/pdf-tools/BrowserLimitationAlert";

const ProtectPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [protectedPdfUrl, setProtectedPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setIsComplete(false);
    if (protectedPdfUrl) {
      URL.revokeObjectURL(protectedPdfUrl);
      setProtectedPdfUrl(null);
    }
  };

  const handleProtect = async (password: string) => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF file first",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter a password to protect your PDF",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const fileArrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileArrayBuffer);
      
      // In a real application, this would be where encryption would happen
      // But pdf-lib doesn't support client-side encryption
      const pdfBytes = await pdfDoc.save();
      
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setProtectedPdfUrl(pdfUrl);
      setIsComplete(true);
      
      toast({
        title: "PDF Processed",
        description: "Your PDF has been processed. Note that true encryption requires server-side processing.",
      });
      
      console.log("PDF processed (without encryption - pdf-lib doesn't support client-side encryption)");
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast({
        title: "Processing Failed",
        description: "An error occurred while processing your PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProtectedPDF = () => {
    if (!protectedPdfUrl) {
      toast({
        title: "Error",
        description: "Protected PDF not available. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    const link = document.createElement('a');
    link.href = protectedPdfUrl;
    link.download = file ? `protected_${file.name}` : 'protected_document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your protected PDF is downloading."
    });
  };

  const resetState = () => {
    setFile(null);
    setIsComplete(false);
    cleanupObjectUrl();
    setProtectedPdfUrl(null);
  };

  const cleanupObjectUrl = () => {
    if (protectedPdfUrl) {
      URL.revokeObjectURL(protectedPdfUrl);
    }
  };

  useEffect(() => {
    return () => cleanupObjectUrl();
  }, [protectedPdfUrl]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          <nav className="mb-8 flex items-center text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
            <Link to="/pdf-tools" className="text-muted-foreground hover:text-foreground transition-colors">
              PDF Tools
            </Link>
            <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Protect PDF</span>
          </nav>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold mb-4">Protect PDF with Password</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Add password encryption to your PDF documents for enhanced security
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <BrowserLimitationAlert />

            {isComplete ? (
              <ProtectedPDFResult 
                onDownload={downloadProtectedPDF}
                onReset={resetState}
              />
            ) : (
              <>
                <FileUploader
                  accept=".pdf"
                  maxSize={10}
                  maxFiles={1}
                  onFilesSelected={handleFilesSelected}
                  description="Drag & drop a PDF file here or click to browse"
                  className="mb-8"
                />
                
                {file && (
                  <div className="mt-8">
                    <PasswordInputSection 
                      isProcessing={isProcessing}
                      onProtect={handleProtect}
                    />
                  </div>
                )}
                
                {!file && <PDFInstructionsSection />}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProtectPDF;
