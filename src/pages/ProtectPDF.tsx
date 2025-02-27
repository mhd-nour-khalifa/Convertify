
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "@/components/FileUploader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ProtectPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setIsComplete(false);
  };

  const handleProtect = () => {
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

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "The passwords you entered don't match",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      toast({
        title: "PDF Protected Successfully!",
        description: "Your PDF has been encrypted with a password.",
      });
    }, 2000);
  };

  const downloadProtectedPDF = () => {
    toast({
      title: "Download Started",
      description: "Your protected PDF is downloading."
    });
    // In a real app, this would be a link to the protected PDF file
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
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
          
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold mb-4">Protect PDF with Password</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Add password encryption to your PDF documents for enhanced security
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {isComplete ? (
              <div className="bg-card rounded-xl p-8 shadow-subtle text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-medium mb-4">Your PDF is Now Protected!</h2>
                <p className="text-muted-foreground mb-8">
                  Your PDF has been successfully encrypted with a password.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    onClick={downloadProtectedPDF}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Download Protected PDF
                  </Button>
                  <Button 
                    onClick={() => {
                      setFile(null);
                      setPassword("");
                      setConfirmPassword("");
                      setIsComplete(false);
                    }}
                    variant="outline"
                  >
                    Protect Another PDF
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* File Uploader */}
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
                    <div className="bg-card rounded-xl p-8 shadow-subtle">
                      <h3 className="text-xl font-medium mb-6">Set Password Protection</h3>
                      
                      <div className="space-y-6 max-w-md mx-auto">
                        <div className="space-y-2">
                          <label className="text-sm font-medium" htmlFor="password">Password</label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium" htmlFor="confirm-password">Confirm Password</label>
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                        
                        <Button
                          onClick={handleProtect}
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
                              <Lock className="mr-2 h-4 w-4" />
                              Protect PDF
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Instructions */}
                {!file && (
                  <div className="bg-secondary/50 rounded-xl p-6 mt-8">
                    <h3 className="text-lg font-medium mb-3">How to Protect a PDF with Password</h3>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Upload your PDF file using the upload box above</li>
                      <li>Enter and confirm a strong password for protection</li>
                      <li>Click the "Protect PDF" button</li>
                      <li>Download your password-protected PDF</li>
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

export default ProtectPDF;
