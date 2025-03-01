import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Unlock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "@/components/FileUploader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PDFDocument } from "pdf-lib";
import BrowserLimitationAlert from "@/components/pdf-tools/BrowserLimitationAlert";

const UnlockPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [unlockedPdfUrl, setUnlockedPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setIsComplete(false);
    cleanupObjectUrl();
  };

  const handleUnlock = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a password-protected PDF file first",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter the password for this PDF",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const fileArrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileArrayBuffer, password);
      
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setUnlockedPdfUrl(pdfUrl);
      setIsComplete(true);
      
      toast({
        title: "PDF Unlocked Successfully!",
        description: "Password protection has been removed from your PDF.",
      });
      
      console.log("PDF unlocked successfully");
    } catch (error) {
      console.error("Error unlocking PDF:", error);
      toast({
        title: "Unlocking Failed",
        description: "The password may be incorrect or the PDF cannot be unlocked in the browser.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadUnlockedPDF = () => {
    if (!unlockedPdfUrl) {
      toast({
        title: "Error",
        description: "Unlocked PDF not available. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    const link = document.createElement('a');
    link.href = unlockedPdfUrl;
    link.download = file ? `unlocked_${file.name}` : 'unlocked_document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your unlocked PDF is downloading."
    });
  };

  const resetState = () => {
    setFile(null);
    setPassword("");
    setIsComplete(false);
    cleanupObjectUrl();
  };

  const cleanupObjectUrl = () => {
    if (unlockedPdfUrl) {
      URL.revokeObjectURL(unlockedPdfUrl);
      setUnlockedPdfUrl(null);
    }
  };

  useEffect(() => {
    return () => cleanupObjectUrl();
  }, [unlockedPdfUrl]);

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
            <span className="text-foreground font-medium">Unlock PDF</span>
          </nav>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold mb-4">Remove PDF Password Protection</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Unlock password-protected PDF files quickly and easily
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <BrowserLimitationAlert />
            
            {isComplete ? (
              <div className="bg-card rounded-xl p-8 shadow-subtle text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Unlock className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-medium mb-4">Your PDF is Now Unlocked!</h2>
                <p className="text-muted-foreground mb-8">
                  The password protection has been successfully removed from your PDF.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    onClick={downloadUnlockedPDF}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Download Unlocked PDF
                  </Button>
                  <Button 
                    onClick={resetState}
                    variant="outline"
                  >
                    Unlock Another PDF
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <FileUploader
                  accept=".pdf"
                  maxSize={10}
                  maxFiles={1}
                  onFilesSelected={handleFilesSelected}
                  description="Drag & drop a password-protected PDF file here or click to browse"
                  className="mb-8"
                />
                
                {file && (
                  <div className="mt-8">
                    <div className="bg-card rounded-xl p-8 shadow-subtle">
                      <h3 className="text-xl font-medium mb-6">Enter PDF Password</h3>
                      
                      <div className="space-y-6 max-w-md mx-auto">
                        <div className="space-y-2">
                          <label className="text-sm font-medium" htmlFor="password">Password</label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter the PDF password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                        
                        <Button
                          onClick={handleUnlock}
                          disabled={isProcessing}
                          className="w-full"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Unlock className="mr-2 h-4 w-4" />
                              Unlock PDF
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {!file && (
                  <div className="bg-secondary/50 rounded-xl p-6 mt-8">
                    <h3 className="text-lg font-medium mb-3">How to Unlock a PDF</h3>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Upload your password-protected PDF using the upload box above</li>
                      <li>Enter the correct password for the PDF</li>
                      <li>Click the "Unlock PDF" button</li>
                      <li>Download your unlocked PDF document</li>
                    </ol>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UnlockPDF;
