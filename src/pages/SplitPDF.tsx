
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "@/components/FileUploader";
import { Loader2, Scissors, Download, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const SplitPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitMethod, setSplitMethod] = useState<"ranges" | "every">("ranges");
  const [pageRanges, setPageRanges] = useState<string>("");
  const [splitEveryN, setSplitEveryN] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const handleFileSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      setFile(null);
      setPageCount(0);
      return;
    }
    
    setFile(selectedFiles[0]);
    // In a real app, we would extract the page count from the PDF
    // For this demo, we'll simulate a page count
    setPageCount(Math.floor(Math.random() * 15) + 5);
    setIsComplete(false);
  };

  const validatePageRanges = (): boolean => {
    if (splitMethod === "every") {
      return splitEveryN > 0 && splitEveryN <= pageCount;
    }
    
    if (!pageRanges.trim()) {
      toast({
        title: "Invalid page ranges",
        description: "Please enter at least one page range",
        variant: "destructive",
      });
      return false;
    }
    
    const rangePattern = /^\s*(\d+|\d+-\d+)(\s*,\s*(\d+|\d+-\d+))*\s*$/;
    if (!rangePattern.test(pageRanges)) {
      toast({
        title: "Invalid format",
        description: "Use format like: 1-3, 5, 7-9",
        variant: "destructive",
      });
      return false;
    }
    
    const ranges = pageRanges.split(",").map(r => r.trim());
    for (const range of ranges) {
      if (range.includes("-")) {
        const [start, end] = range.split("-").map(Number);
        if (start < 1 || end > pageCount || start > end) {
          toast({
            title: "Invalid page range",
            description: `Range ${range} is invalid. Pages must be between 1 and ${pageCount}`,
            variant: "destructive",
          });
          return false;
        }
      } else {
        const page = Number(range);
        if (page < 1 || page > pageCount) {
          toast({
            title: "Invalid page number",
            description: `Page ${page} is invalid. Pages must be between 1 and ${pageCount}`,
            variant: "destructive",
          });
          return false;
        }
      }
    }
    
    return true;
  };

  const splitPDF = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF file to split",
        variant: "destructive",
      });
      return;
    }
    
    if (!validatePageRanges()) {
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      toast({
        title: "PDF Successfully Split!",
        description: "Your file has been split according to your specifications.",
      });
    }, 2000);
  };

  const downloadSplitPDFs = () => {
    toast({
      title: "Download Started",
      description: "Your split PDFs are downloading.",
    });
    // In a real app, this would be a link to download the split PDF files
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
            <span className="text-foreground font-medium">Split PDF</span>
          </nav>
          
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold mb-4">Split PDF Files</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Separate PDF pages or extract specific page ranges
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {isComplete ? (
              <div className="bg-card rounded-xl p-8 shadow-subtle text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Scissors className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-medium mb-4">Your PDF Has Been Split!</h2>
                <p className="text-muted-foreground mb-8">
                  The PDF has been successfully split according to your specifications.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={downloadSplitPDFs}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Split PDFs
                  </button>
                  <button 
                    onClick={() => {
                      setFile(null);
                      setPageCount(0);
                      setPageRanges("");
                      setSplitEveryN(1);
                      setIsComplete(false);
                    }}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Split Another PDF
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* File Uploader */}
                <FileUploader
                  accept=".pdf"
                  maxSize={10}
                  maxFiles={1}
                  onFilesSelected={handleFileSelected}
                  description="Drag & drop a PDF file here or click to browse"
                  className="mb-8"
                />
                
                {file && pageCount > 0 && (
                  <div className="mt-8 bg-card rounded-xl p-6 shadow-subtle">
                    <h3 className="text-lg font-medium mb-4">Split Options</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      PDF: {file.name} ({pageCount} pages)
                    </p>
                    
                    <div className="space-y-6">
                      {/* Split Method Selection */}
                      <div>
                        <label className="block text-base font-medium mb-2">
                          Split Method
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="splitMethod"
                              checked={splitMethod === "ranges"}
                              onChange={() => setSplitMethod("ranges")}
                              className="mr-2"
                            />
                            Specific Page Ranges
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="splitMethod"
                              checked={splitMethod === "every"}
                              onChange={() => setSplitMethod("every")}
                              className="mr-2"
                            />
                            Split Every N Pages
                          </label>
                        </div>
                      </div>
                      
                      {/* Split Options Based on Method */}
                      {splitMethod === "ranges" ? (
                        <div>
                          <label className="block text-base font-medium mb-2">
                            Page Ranges
                          </label>
                          <input
                            type="text"
                            value={pageRanges}
                            onChange={(e) => setPageRanges(e.target.value)}
                            placeholder="e.g., 1-3, 5, 7-9"
                            className="w-full p-3 border border-input rounded-lg"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Specify page ranges separated by commas. Example: 1-3, 5, 7-9
                          </p>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-base font-medium mb-2">
                            Split Every
                          </label>
                          <div className="flex items-center">
                            <input
                              type="number"
                              min="1"
                              max={pageCount}
                              value={splitEveryN}
                              onChange={(e) => setSplitEveryN(parseInt(e.target.value) || 1)}
                              className="w-24 p-3 border border-input rounded-lg"
                            />
                            <span className="ml-3">Page(s)</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Split the PDF into multiple documents every {splitEveryN} page(s)
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={splitPDF}
                        disabled={isProcessing}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70 transition-colors px-8 py-3 rounded-lg font-medium inline-flex items-center justify-center"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Scissors className="mr-2 h-5 w-5" />
                            Split PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Instructions */}
                {!file && (
                  <div className="bg-secondary/50 rounded-xl p-6 mt-8">
                    <h3 className="text-lg font-medium mb-3">How to Split PDF Files</h3>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Upload a PDF file using the upload box above</li>
                      <li>Choose your preferred split method</li>
                      <li>For specific ranges, enter page numbers (e.g., 1-3, 5, 7-9)</li>
                      <li>For splitting every N pages, specify how many pages per document</li>
                      <li>Click the "Split PDF" button and download your files</li>
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

export default SplitPDF;
