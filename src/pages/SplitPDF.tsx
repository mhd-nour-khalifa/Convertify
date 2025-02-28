import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "@/components/FileUploader";
import { Loader2, Scissors, Download, ChevronRight, ChevronLeft, ArrowLeft, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";

const SplitPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [splitMethod, setSplitMethod] = useState<"ranges" | "every" | "selected">("ranges");
  const [pageRanges, setPageRanges] = useState<string>("");
  const [splitEveryN, setSplitEveryN] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [splitFiles, setSplitFiles] = useState<{ name: string, data: Uint8Array }[]>([]);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
  const { toast } = useToast();

  const handleFileSelected = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      setFile(null);
      setPageCount(0);
      setPdfArrayBuffer(null);
      setPagePreviews([]);
      setSelectedPages([]);
      return;
    }
    
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setIsComplete(false);
    setSplitFiles([]);
    setPagePreviews([]);
    setSelectedPages([]);
    
    try {
      // Extract the actual page count from the PDF
      const arrayBuffer = await selectedFile.arrayBuffer();
      setPdfArrayBuffer(arrayBuffer);
      
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const actualPageCount = pdfDoc.getPageCount();
      setPageCount(actualPageCount);
      
      // Generate page previews
      generatePagePreviews(arrayBuffer);
      
      toast({
        title: "PDF Loaded",
        description: `Successfully loaded PDF with ${actualPageCount} pages.`,
      });
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast({
        title: "Error loading PDF",
        description: "Could not load the PDF file. It might be corrupted or password-protected.",
        variant: "destructive",
      });
      setFile(null);
      setPageCount(0);
      setPdfArrayBuffer(null);
    }
  };

  const generatePagePreviews = async (arrayBuffer: ArrayBuffer) => {
    setIsGeneratingPreviews(true);
    try {
      const previewsArray = [];
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      // We'll generate page previews in batches to avoid browser hanging
      const batchSize = 5;
      for (let i = 0; i < pageCount; i += batchSize) {
        await new Promise(resolve => setTimeout(resolve, 0)); // Let the UI breathe
        
        const batchEnd = Math.min(i + batchSize, pageCount);
        for (let j = i; j < batchEnd; j++) {
          const newPdfDoc = await PDFDocument.create();
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [j]);
          newPdfDoc.addPage(copiedPage);
          
          const pdfBytes = await newPdfDoc.saveAsBase64({ dataUri: true });
          previewsArray[j] = pdfBytes;
          
          // Update previews array as we go
          setPagePreviews([...previewsArray]);
        }
      }
      
      setIsGeneratingPreviews(false);
    } catch (error) {
      console.error("Error generating previews:", error);
      setIsGeneratingPreviews(false);
      toast({
        title: "Error generating previews",
        description: "Could not generate page previews. The PDF might be corrupted.",
        variant: "destructive",
      });
    }
  };

  const togglePageSelection = (pageIndex: number) => {
    setSelectedPages(prevSelected => {
      if (prevSelected.includes(pageIndex)) {
        return prevSelected.filter(p => p !== pageIndex);
      } else {
        return [...prevSelected, pageIndex].sort((a, b) => a - b);
      }
    });
  };

  const validatePageRanges = (): boolean => {
    if (splitMethod === "every") {
      return splitEveryN > 0 && splitEveryN <= pageCount;
    }
    
    if (splitMethod === "selected") {
      if (selectedPages.length === 0) {
        toast({
          title: "No pages selected",
          description: "Please select at least one page to split",
          variant: "destructive",
        });
        return false;
      }
      return true;
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

  const downloadSplitPDFs = () => {
    if (splitFiles.length === 0) {
      toast({
        title: "No files to download",
        description: "There are no split PDF files to download.",
        variant: "destructive",
      });
      return;
    }
    
    const downloadSingle = (file: { name: string, data: Uint8Array }, index: number) => {
      try {
        // Create blob with proper MIME type
        const blob = new Blob([file.data], { type: "application/pdf" });
        
        // Create a download URL
        const url = window.URL.createObjectURL(blob);
        
        // Create an invisible iframe for more reliable downloads
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Open the URL in the iframe context
        if (iframe.contentWindow) {
          iframe.contentWindow.location.href = url;
        
          // Create a fallback direct download link in case iframe approach fails
          const downloadLink = document.createElement("a");
          downloadLink.href = url;
          downloadLink.download = file.name;
          downloadLink.style.display = 'none';
          document.body.appendChild(downloadLink);
          
          // Trigger download
          downloadLink.click();
          
          // Clean up
          setTimeout(() => {
            // Remove elements
            document.body.removeChild(iframe);
            document.body.removeChild(downloadLink);
            
            // Release object URL
            window.URL.revokeObjectURL(url);
            
            console.log(`Downloaded file ${index + 1}/${splitFiles.length}: ${file.name}`);
            
            // Show success toast for each file
            toast({
              title: "Download Complete",
              description: `File ${index + 1}: ${file.name} has been downloaded.`,
            });
          }, 2000);
        }
      } catch (error) {
        console.error("Error downloading file:", error);
        toast({
          title: "Download Error",
          description: `Failed to download ${file.name}. Please try again.`,
          variant: "destructive",
        });
      }
    };
    
    // If there's just one file, download it directly
    if (splitFiles.length === 1) {
      downloadSingle(splitFiles[0], 0);
      
      toast({
        title: "Download Started",
        description: `Downloading ${splitFiles[0].name}`,
      });
      return;
    }
    
    // For multiple files, download each one with a delay
    toast({
      title: "Downloads Starting",
      description: `Downloading ${splitFiles.length} split PDF files.`,
    });
    
    splitFiles.forEach((file, index) => {
      setTimeout(() => {
        downloadSingle(file, index);
      }, index * 2000); // 2 second delay between downloads to prevent browser blocking
    });
  };

  const splitPDF = async () => {
    if (!file || !pdfArrayBuffer) {
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
    setSplitFiles([]);
    
    try {
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const results = [];
      
      if (splitMethod === "selected") {
        // Process selected pages
        if (selectedPages.length === 0) {
          toast({
            title: "No pages selected",
            description: "Please select at least one page to split",
            variant: "destructive",
          });
          setIsProcessing(false);
          return;
        }

        const newPdfDoc = await PDFDocument.create();
        const pageIndices = selectedPages;
        const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach(page => newPdfDoc.addPage(page));
        
        const pdfBytes = await newPdfDoc.save();
        
        const pageDescription = selectedPages.length === 1 
          ? `page_${selectedPages[0] + 1}` 
          : `pages_${selectedPages.map(p => p + 1).join('_')}`;
        
        const fileName = `${file.name.replace('.pdf', '')}_${pageDescription}.pdf`;
        
        results.push({
          name: fileName,
          data: new Uint8Array(pdfBytes)
        });
        
        console.log(`Created PDF with ${selectedPages.length} selected pages`);
      } else if (splitMethod === "ranges") {
        // Process range splitting
        const ranges = pageRanges.split(",").map(r => r.trim());
        
        for (let i = 0; i < ranges.length; i++) {
          const range = ranges[i];
          let pageIndices = [];
          
          if (range.includes("-")) {
            const [start, end] = range.split("-").map(Number);
            for (let j = start - 1; j < end; j++) {
              pageIndices.push(j);
            }
          } else {
            pageIndices.push(Number(range) - 1);
          }
          
          const newPdfDoc = await PDFDocument.create();
          const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);
          copiedPages.forEach(page => newPdfDoc.addPage(page));
          
          const pdfBytes = await newPdfDoc.save();
          
          let fileName = `${file.name.replace('.pdf', '')}_pages_`;
          if (range.includes("-")) {
            fileName += range.replace("-", "to");
          } else {
            fileName += range;
          }
          fileName += ".pdf";
          
          results.push({
            name: fileName,
            data: new Uint8Array(pdfBytes)
          });
        }
      } else {
        // Process "every N pages" splitting
        const pageIndices = pdfDoc.getPageIndices();
        
        for (let i = 0; i < pageIndices.length; i += splitEveryN) {
          const newPdfDoc = await PDFDocument.create();
          const pageIndicesToCopy = pageIndices.slice(i, i + splitEveryN);
          const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndicesToCopy);
          copiedPages.forEach(page => newPdfDoc.addPage(page));
          
          const pdfBytes = await newPdfDoc.save();
          
          const startPage = i + 1;
          const endPage = Math.min(i + splitEveryN, pageIndices.length);
          const fileName = `${file.name.replace('.pdf', '')}_${startPage}to${endPage}.pdf`;
          
          results.push({
            name: fileName,
            data: new Uint8Array(pdfBytes)
          });
        }
      }
      
      setSplitFiles(results);
      setIsProcessing(false);
      setIsComplete(true);
      
      console.log(`Split complete: Created ${results.length} PDF files`);
      
      toast({
        title: "PDF Successfully Split!",
        description: `Your PDF has been split into ${results.length} file(s).`,
      });
    } catch (error) {
      console.error("Error splitting PDF:", error);
      setIsProcessing(false);
      toast({
        title: "Error splitting PDF",
        description: "An error occurred while splitting the PDF. Please try again.",
        variant: "destructive",
      });
    }
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
                  The PDF has been successfully split into {splitFiles.length} separate file(s).
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    onClick={downloadSplitPDFs}
                    variant="default"
                    className="inline-flex items-center justify-center"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Split PDF{splitFiles.length > 1 ? "s" : ""}
                  </Button>
                  <Button 
                    onClick={() => {
                      setFile(null);
                      setPageCount(0);
                      setPageRanges("");
                      setSplitEveryN(1);
                      setIsComplete(false);
                      setSplitFiles([]);
                      setSelectedPages([]);
                      setPagePreviews([]);
                      setPdfArrayBuffer(null);
                    }}
                    variant="secondary"
                    className="inline-flex items-center justify-center"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Split Another PDF
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
                  onFilesSelected={handleFileSelected}
                  description="Drag & drop a PDF file here or click to browse"
                  className="mb-8"
                />
                
                {file && pageCount > 0 && (
                  <div className="mt-8">
                    {/* PDF Preview Section */}
                    <div className="bg-card rounded-xl p-6 shadow-subtle mb-8">
                      <h3 className="text-lg font-medium mb-4">PDF Preview</h3>
                      <p className="text-muted-foreground text-sm mb-6">
                        PDF: {file.name} ({pageCount} pages)
                      </p>
                      
                      {isGeneratingPreviews ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                          <p className="text-muted-foreground">Generating page previews...</p>
                        </div>
                      ) : (
                        <>
                          {splitMethod === "selected" && (
                            <p className="text-sm text-muted-foreground mb-4">
                              Click on pages to select them for extraction. Selected pages will be highlighted.
                            </p>
                          )}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                            {pagePreviews.map((preview, index) => (
                              <div 
                                key={index} 
                                className={`relative rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                                  splitMethod === "selected" && selectedPages.includes(index) 
                                    ? "border-primary ring-2 ring-primary/30" 
                                    : "border-muted-foreground/10 hover:border-muted-foreground/30"
                                }`}
                                onClick={() => splitMethod === "selected" && togglePageSelection(index)}
                              >
                                {/* Embed PDF preview as iframe instead of img for better rendering */}
                                <div className="w-full aspect-[3/4] bg-gray-50">
                                  <iframe 
                                    src={preview} 
                                    title={`Page ${index + 1}`} 
                                    className="w-full h-full"
                                    frameBorder="0"
                                  ></iframe>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-background/80 text-xs p-1 text-center">
                                  Page {index + 1}
                                </div>
                                {splitMethod === "selected" && selectedPages.includes(index) && (
                                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                    {selectedPages.indexOf(index) + 1}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Split Options */}
                    <div className="bg-card rounded-xl p-6 shadow-subtle">
                      <h3 className="text-lg font-medium mb-4">Split Options</h3>
                      
                      <div className="space-y-6">
                        {/* Split Method Selection */}
                        <div>
                          <label className="block text-base font-medium mb-2">
                            Split Method
                          </label>
                          <div className="flex flex-wrap gap-4">
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
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="splitMethod"
                                checked={splitMethod === "selected"}
                                onChange={() => setSplitMethod("selected")}
                                className="mr-2"
                              />
                              Selected Pages
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
                        ) : splitMethod === "every" ? (
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
                        ) : (
                          <div>
                            <label className="block text-base font-medium mb-2">
                              Selected Pages
                            </label>
                            <p className="text-sm text-muted-foreground">
                              {selectedPages.length === 0 
                                ? "No pages selected. Click on the thumbnails above to select pages." 
                                : `Selected ${selectedPages.length} pages: ${selectedPages.map(p => p + 1).join(', ')}`}
                            </p>
                            {selectedPages.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => setSelectedPages([])}
                              >
                                Clear Selection
                              </Button>
                            )}
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
                  </div>
                )}
                
                {/* Instructions */}
                {!file && (
                  <div className="bg-secondary/50 rounded-xl p-6 mt-8">
                    <h3 className="text-lg font-medium mb-3">How to Split PDF Files</h3>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Upload a PDF file using the upload box above</li>
                      <li>Preview the PDF pages and choose your preferred split method</li>
                      <li>For specific ranges, enter page numbers (e.g., 1-3, 5, 7-9)</li>
                      <li>For splitting every N pages, specify how many pages per document</li>
                      <li>For selected pages, click on the thumbnails to select specific pages</li>
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
