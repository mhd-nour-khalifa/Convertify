
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Download, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import * as pdfParse from 'pdf-parse';

const PDFToText = () => {
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    setIsProcessing(true);
    setExtractedText("");

    try {
      // Read the PDF file as an ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Parse the PDF using pdf-parse
      const data = await pdfParse(arrayBuffer);
      
      // Set the extracted text
      setExtractedText(data.text);
      
      toast({
        title: "Success",
        description: "Text extracted successfully!",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error extracting text:", error);
      toast({
        title: "Error",
        description: "Failed to extract text from PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = () => {
    if (!extractedText) return;
    
    navigator.clipboard.writeText(extractedText)
      .then(() => {
        toast({
          title: "Copied",
          description: "Text copied to clipboard",
          duration: 2000,
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy text",
          variant: "destructive",
        });
      });
  };

  const handleDownloadText = () => {
    if (!extractedText) return;
    
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-text.txt";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Downloaded",
      description: "Text file downloaded successfully",
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Link
            to="/pdf-tools"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            PDF Tools
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">PDF to Text</span>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Convert PDF to Text</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Extract text content from your PDF documents quickly and accurately
          </p>
        </div>

        {/* File Upload Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <FileUploader
            accept=".pdf"
            maxSize={10}
            maxFiles={1}
            onFilesSelected={handleFilesSelected}
            disabled={isProcessing}
            description="Drop your PDF here or click to browse"
          />
        </div>

        {/* Results Section */}
        {extractedText && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-lg p-6 shadow-subtle">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Extracted Text</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyText}
                    className="flex items-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadText}
                    className="flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-md whitespace-pre-wrap h-80 overflow-y-auto text-sm">
                {extractedText}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PDFToText;
