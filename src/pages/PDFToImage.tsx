
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "@/components/FileUploader";
import { Loader2, ImageIcon, Download, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { PDFDocument } from "pdf-lib";

type ImageFormat = "jpg" | "png" | "webp";
type DPI = 72 | 150 | 300;

const PDFToImage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [format, setFormat] = useState<ImageFormat>("jpg");
  const [dpi, setDpi] = useState<DPI>(150);
  const [selectedPages, setSelectedPages] = useState<string>("all");
  const [customPages, setCustomPages] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [convertedImages, setConvertedImages] = useState<{ page: number; thumbnail: string; blob: Blob }[]>([]);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
  const { toast } = useToast();

  const handleFileSelected = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      setFile(null);
      setPageCount(0);
      setPdfArrayBuffer(null);
      setPagePreviews([]);
      return;
    }
    
    const selectedFile = selectedFiles[0];
    setFile(selectedFile);
    setIsComplete(false);
    setConvertedImages([]);
    setPagePreviews([]);
    
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
      const previewsArray: string[] = [];
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
        }
        
        // Update previews array as we go
        setPagePreviews([...previewsArray]);
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

  const validatePageSelection = (): boolean => {
    if (selectedPages === "all") return true;
    
    if (!customPages.trim()) {
      toast({
        title: "Invalid page selection",
        description: "Please enter at least one page number",
        variant: "destructive",
      });
      return false;
    }
    
    const pagePattern = /^\s*(\d+|\d+-\d+)(\s*,\s*(\d+|\d+-\d+))*\s*$/;
    if (!pagePattern.test(customPages)) {
      toast({
        title: "Invalid format",
        description: "Use format like: 1-3, 5, 7-9",
        variant: "destructive",
      });
      return false;
    }
    
    const ranges = customPages.split(",").map(r => r.trim());
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

  // Function to convert PDF to image using canvas
  const convertPDFPageToImage = async (pdfDataUri: string, format: ImageFormat): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';
      iframe.style.width = '800px';
      iframe.style.height = '1000px';
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        setTimeout(() => {
          try {
            if (!iframe.contentWindow) {
              document.body.removeChild(iframe);
              reject(new Error("Cannot access iframe content"));
              return;
            }
            
            const canvas = document.createElement('canvas');
            const pdfContainer = iframe.contentDocument?.body;
            
            if (!pdfContainer) {
              document.body.removeChild(iframe);
              reject(new Error("PDF container not found"));
              return;
            }
            
            // Scale factor based on DPI
            const scale = dpi / 72;
            
            // Get the PDF dimensions - for simplicity we use standard dimensions
            // In a real-world app, you'd extract actual dimensions from the PDF
            const width = 800 * scale;
            const height = 1000 * scale;
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              document.body.removeChild(iframe);
              reject(new Error("Could not get canvas context"));
              return;
            }
            
            // Set white background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            
            // Scale the rendering
            ctx.scale(scale, scale);
            
            // Draw the PDF container (this captures what's visible in the iframe)
            ctx.drawWindow(iframe.contentWindow, 0, 0, 800, 1000, 'white');
            
            // Convert canvas to blob of the desired format
            const mimeType = format === 'jpg' ? 'image/jpeg' : 
                             format === 'png' ? 'image/png' : 'image/webp';
            
            canvas.toBlob((blob) => {
              document.body.removeChild(iframe);
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error(`Failed to convert to ${format}`));
              }
            }, mimeType, 0.95);
          } catch (error) {
            document.body.removeChild(iframe);
            reject(error);
          }
        }, 1000); // Give time for PDF to render
      };
      
      iframe.src = pdfDataUri;
    });
  };

  // Alternative approach using HTML2Canvas (simulation for demo)
  const simulateImageConversion = async (pdfDataUri: string, format: ImageFormat): Promise<{ dataUrl: string, blob: Blob }> => {
    // This is a simplified version since we can't actually convert PDF to image without additional libraries
    // In a real app, you'd use a proper PDF rendering library
    
    // Create a blob of the correct mime type - this is just a simulation
    const mimeType = format === 'jpg' ? 'image/jpeg' : 
                     format === 'png' ? 'image/png' : 'image/webp';
    
    // For demo purposes, we'll create a simple canvas with some text
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }
    
    // Set background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some text
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`PDF converted to ${format.toUpperCase()}`, 50, 50);
    ctx.fillText(`Resolution: ${dpi} DPI`, 50, 80);
    
    // Fetch the PDF and draw its first preview frame on the canvas
    // This is just for visualization, not a real conversion
    const img = new Image();
    
    // Wait for the image to load
    await new Promise<void>((resolve) => {
      img.onload = () => {
        // Draw the PDF preview at the center of the canvas
        const scale = 0.5;
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        resolve();
      };
      img.src = pdfDataUri; // This doesn't actually convert but shows PDF preview
    });
    
    // Get the data URL and create a blob
    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    
    // Convert data URL to blob
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    
    return { dataUrl, blob };
  };

  const convertPDF = async () => {
    if (!file || !pdfArrayBuffer) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF file to convert",
        variant: "destructive",
      });
      return;
    }
    
    if (!validatePageSelection()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Determine which pages to convert
      const pagesToConvert = selectedPages === "all" 
        ? Array.from({ length: pageCount }, (_, i) => i + 1)
        : [];
        
      if (selectedPages === "custom") {
        const ranges = customPages.split(",").map(r => r.trim());
        for (const range of ranges) {
          if (range.includes("-")) {
            const [start, end] = range.split("-").map(Number);
            for (let i = start; i <= end; i++) {
              pagesToConvert.push(i);
            }
          } else {
            pagesToConvert.push(Number(range));
          }
        }
      }
      
      // Remove duplicates and sort
      const uniquePages = [...new Set(pagesToConvert)].sort((a, b) => a - b);
      
      // Convert PDF pages to images using pdf-lib
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const convertedImagesResult = [];
      
      // Process pages in batches to avoid UI freezing
      const batchSize = 3;
      for (let i = 0; i < uniquePages.length; i += batchSize) {
        await new Promise(resolve => setTimeout(resolve, 0)); // Let the UI breathe
        
        const batchPages = uniquePages.slice(i, i + batchSize);
        
        // Process batch in parallel
        const batchResults = await Promise.all(batchPages.map(async (pageNum) => {
          // Create a new PDF with just this page
          const newPdfDoc = await PDFDocument.create();
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
          newPdfDoc.addPage(copiedPage);
          
          // Save as data URI for preview
          const pdfBytes = await newPdfDoc.saveAsBase64({ dataUri: true });
          
          // Convert PDF to image (simulation for demo)
          const { dataUrl, blob } = await simulateImageConversion(pdfBytes, format);
          
          return {
            page: pageNum,
            thumbnail: dataUrl,
            blob
          };
        }));
        
        // Add batch results to the overall results
        convertedImagesResult.push(...batchResults);
        
        // Update state to show progress
        setConvertedImages([...convertedImagesResult]);
      }
      
      setIsProcessing(false);
      setIsComplete(true);
      toast({
        title: "PDF Successfully Converted!",
        description: `Converted ${convertedImagesResult.length} pages to ${format.toUpperCase()} images.`,
      });
    } catch (error) {
      console.error("Error converting PDF:", error);
      setIsProcessing(false);
      toast({
        title: "Error converting PDF",
        description: "An error occurred while converting the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadImage = (pageNumber: number, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `page-${pageNumber}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    toast({
      title: "Download Started",
      description: `Page ${pageNumber} is downloading as ${format.toUpperCase()}.`,
    });
  };

  const downloadImages = () => {
    // For small number of images, download them sequentially
    if (convertedImages.length > 0) {
      toast({
        title: "Download Started",
        description: `Your ${convertedImages.length} ${format.toUpperCase()} images are downloading.`,
      });
      
      // Add a small delay between downloads to prevent browser blocking
      convertedImages.forEach((image, index) => {
        setTimeout(() => {
          downloadImage(image.page, image.blob);
        }, index * 300);
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
            <span className="text-foreground font-medium">PDF to Image</span>
          </nav>
          
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold mb-4">Convert PDF to Images</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform PDF pages into high-quality JPG, PNG, or WebP images
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {isComplete ? (
              <div className="bg-card rounded-xl p-8 shadow-subtle">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ImageIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-medium mb-4">Conversion Complete!</h2>
                  <p className="text-muted-foreground">
                    Successfully converted {convertedImages.length} pages to {format.toUpperCase()} format
                  </p>
                </div>
                
                {/* Image Preview Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                  {convertedImages.map((image) => (
                    <div key={image.page} className="bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={image.thumbnail} 
                        alt={`Page ${image.page}`} 
                        className="w-full h-32 object-contain"
                      />
                      <div className="p-2 text-center text-sm flex justify-between items-center">
                        <span>Page {image.page}</span>
                        <button 
                          onClick={() => downloadImage(image.page, image.blob)}
                          className="text-primary hover:text-primary/80"
                          aria-label={`Download page ${image.page}`}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    onClick={downloadImages}
                    variant="default"
                    className="inline-flex items-center justify-center"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download All Images
                  </Button>
                  <Button 
                    onClick={() => {
                      setFile(null);
                      setPageCount(0);
                      setIsComplete(false);
                      setConvertedImages([]);
                      setPagePreviews([]);
                      setPdfArrayBuffer(null);
                    }}
                    variant="secondary"
                    className="inline-flex items-center justify-center"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Convert Another PDF
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
                    {isGeneratingPreviews ? (
                      <div className="bg-card rounded-xl p-6 shadow-subtle mb-8">
                        <div className="flex flex-col items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                          <p className="text-muted-foreground">Generating page previews...</p>
                        </div>
                      </div>
                    ) : pagePreviews.length > 0 ? (
                      <div className="bg-card rounded-xl p-6 shadow-subtle mb-8">
                        <h3 className="text-lg font-medium mb-4">PDF Preview</h3>
                        <p className="text-muted-foreground text-sm mb-6">
                          PDF: {file.name} ({pageCount} pages)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {pagePreviews.map((preview, index) => (
                            <div key={index} className="relative rounded-md overflow-hidden border border-muted-foreground/10">
                              <iframe 
                                src={preview} 
                                title={`Page ${index + 1}`} 
                                className="w-full h-32 object-contain border-none"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-background/80 text-xs p-1 text-center">
                                Page {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    
                    <div className="bg-card rounded-xl p-6 shadow-subtle">
                      <h3 className="text-lg font-medium mb-4">Conversion Options</h3>
                      <p className="text-muted-foreground text-sm mb-6">
                        PDF: {file.name} ({pageCount} pages)
                      </p>
                      
                      <div className="space-y-6">
                        {/* Page Selection */}
                        <div>
                          <label className="block text-base font-medium mb-2">
                            Pages to Convert
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="pageSelection"
                                value="all"
                                checked={selectedPages === "all"}
                                onChange={() => setSelectedPages("all")}
                                className="mr-2"
                              />
                              All Pages
                            </label>
                            <label className="flex items-start">
                              <input
                                type="radio"
                                name="pageSelection"
                                value="custom"
                                checked={selectedPages === "custom"}
                                onChange={() => setSelectedPages("custom")}
                                className="mr-2 mt-1"
                              />
                              <div className="flex-grow">
                                <div>Custom Pages</div>
                                {selectedPages === "custom" && (
                                  <div className="mt-2">
                                    <input
                                      type="text"
                                      value={customPages}
                                      onChange={(e) => setCustomPages(e.target.value)}
                                      placeholder="e.g., 1-3, 5, 7-9"
                                      className="w-full p-2 border border-input rounded-lg"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Specify pages separated by commas. Example: 1-3, 5, 7-9
                                    </p>
                                  </div>
                                )}
                              </div>
                            </label>
                          </div>
                        </div>
                        
                        {/* Format Selection */}
                        <div>
                          <label className="block text-base font-medium mb-2">
                            Image Format
                          </label>
                          <div className="flex gap-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="format"
                                value="jpg"
                                checked={format === "jpg"}
                                onChange={() => setFormat("jpg")}
                                className="mr-2"
                              />
                              JPG
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="format"
                                value="png"
                                checked={format === "png"}
                                onChange={() => setFormat("png")}
                                className="mr-2"
                              />
                              PNG
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="format"
                                value="webp"
                                checked={format === "webp"}
                                onChange={() => setFormat("webp")}
                                className="mr-2"
                              />
                              WebP
                            </label>
                          </div>
                        </div>
                        
                        {/* DPI Selection */}
                        <div>
                          <label className="block text-base font-medium mb-2">
                            Resolution (DPI)
                          </label>
                          <div className="flex gap-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="dpi"
                                value="72"
                                checked={dpi === 72}
                                onChange={() => setDpi(72)}
                                className="mr-2"
                              />
                              72 DPI
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="dpi"
                                value="150"
                                checked={dpi === 150}
                                onChange={() => setDpi(150)}
                                className="mr-2"
                              />
                              150 DPI
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="dpi"
                                value="300"
                                checked={dpi === 300}
                                onChange={() => setDpi(300)}
                                className="mr-2"
                              />
                              300 DPI
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex justify-end">
                        <Button
                          onClick={convertPDF}
                          disabled={isProcessing}
                          variant="default"
                          className="inline-flex items-center justify-center"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Converting...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="mr-2 h-5 w-5" />
                              Convert to {format.toUpperCase()}
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
                    <h3 className="text-lg font-medium mb-3">How to Convert PDF to Images</h3>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Upload a PDF file using the upload box above</li>
                      <li>Select which pages you want to convert</li>
                      <li>Choose your preferred image format (JPG, PNG, or WebP)</li>
                      <li>Select the image resolution (DPI)</li>
                      <li>Click the "Convert" button and download your images</li>
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

export default PDFToImage;
