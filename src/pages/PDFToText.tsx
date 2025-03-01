
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "@/components/FileUploader";

const PDFToText = () => {
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      // TODO: Implement PDF text extraction logic
      // For now, show a message that this feature is coming soon
      toast({
        title: "Coming Soon",
        description: "PDF to Text conversion will be available soon!",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract text from PDF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
              <h2 className="text-xl font-semibold mb-4">Extracted Text</h2>
              <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
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
