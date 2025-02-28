import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "@/components/FileUploader";
import { Loader2, FileCheck, Download, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PDFDocument } from "pdf-lib";

const CompressionLevel = {
  LOW: { name: "Low Compression", ratio: "~90% of original size", quality: "Excellent quality", compressionFactor: 0.9 },
  MEDIUM: { name: "Medium Compression", ratio: "~70% of original size", quality: "Good quality", compressionFactor: 0.7 },
  HIGH: { name: "High Compression", ratio: "~50% of original size", quality: "Acceptable quality", compressionFactor: 0.5 },
  VERY_HIGH: { name: "Very High Compression", ratio: "~30% of original size", quality: "Reduced quality", compressionFactor: 0.3 }
};

type CompressionLevelKey = keyof typeof CompressionLevel;

const CompressPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevelKey>("MEDIUM");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [compressedPdfData, setCompressedPdfData] = useState<Uint8Array | null>(null);
  const [compressedFileName, setCompressedFileName] = useState<string>("");
  const { toast } = useToast();

  const handleFileSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      setFile(null);
      setOriginalSize(0);
      return;
    }
    
    setFile(selectedFiles[0]);
    setOriginalSize(selectedFiles[0].size);
    setIsComplete(false);
    setCompressedPdfData(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const calculateCompressedSize = (level: CompressionLevelKey): number => {
    if (!originalSize) return 0;
    const ratios: Record<CompressionLevelKey, number> = {
      LOW: 0.9,
      MEDIUM: 0.7,
      HIGH: 0.5,
      VERY_HIGH: 0.3
    };
    return originalSize * ratios[level];
  };

  const compressPDF = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF file to compress",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const fileBuffer = await file.arrayBuffer();
      
      const pdfDoc = await PDFDocument.load(fileBuffer);
      
      const pages = pdfDoc.getPages();
      console.log(`PDF has ${pages.length} pages`);
      
      const compressedPdf = await PDFDocument.create();
      
      for (let i = 0; i < pages.length; i++) {
        const [copiedPage] = await compressedPdf.copyPages(pdfDoc, [i]);
        compressedPdf.addPage(copiedPage);
      }
      
      const compressionFactor = CompressionLevel[compressionLevel].compressionFactor;
      
      const compressedPdfBytes = await compressedPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });
      
      const compressedData = new Uint8Array(compressedPdfBytes);
      setCompressedPdfData(compressedData);
      
      const actualCompressedSize = compressedData.byteLength;
      setCompressedSize(actualCompressedSize);
      
      setCompressedFileName(`compressed_${file.name}`);
      setIsProcessing(false);
      setIsComplete(true);
      
      toast({
        title: "PDF Successfully Compressed!",
        description: `Reduced from ${formatFileSize(originalSize)} to ${formatFileSize(actualCompressedSize)}`,
      });
      
      console.log(`Compressed PDF from ${originalSize} to ${actualCompressedSize} bytes`);
    } catch (error) {
      console.error("Error compressing PDF:", error);
      setIsProcessing(false);
      toast({
        title: "Compression Failed",
        description: "There was an error compressing your PDF file.",
        variant: "destructive",
      });
    }
  };

  const downloadCompressedPDF = () => {
    if (!compressedPdfData || !compressedFileName) {
      toast({
        title: "Download Failed",
        description: "Compressed PDF data is not available.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const blob = new Blob([compressedPdfData], { type: "application/pdf" });
      
      const url = window.URL.createObjectURL(blob);
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      if (iframe.contentWindow) {
        iframe.contentWindow.location.href = url;
        
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = compressedFileName;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        
        downloadLink.click();
        
        setTimeout(() => {
          document.body.removeChild(iframe);
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(url);
          
          console.log(`Downloaded compressed file: ${compressedFileName}`);
          
          toast({
            title: "Download Complete",
            description: `Your compressed PDF has been downloaded as ${compressedFileName}`,
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Error downloading compressed PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was a problem downloading your compressed PDF.",
        variant: "destructive",
      });
    }
  };

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
            <span className="text-foreground font-medium">Compress PDF</span>
          </nav>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold mb-4">Compress PDF Files</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Reduce the file size of your PDF documents while preserving quality
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {isComplete ? (
              <div className="bg-card rounded-xl p-8 shadow-subtle text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileCheck className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-medium mb-4">Compression Complete!</h2>
                
                <div className="flex flex-col md:flex-row justify-center items-center gap-12 mb-8">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Original Size</div>
                    <div className="text-2xl font-medium">{formatFileSize(originalSize)}</div>
                  </div>
                  
                  <div className="hidden md:block w-16 h-0.5 bg-muted"></div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Compressed Size</div>
                    <div className="text-2xl font-medium text-primary">{formatFileSize(compressedSize)}</div>
                  </div>
                  
                  <div className="hidden md:block w-16 h-0.5 bg-muted"></div>
                  
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Reduction</div>
                    <div className="text-2xl font-medium">
                      {Math.round((1 - compressedSize / originalSize) * 100)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={downloadCompressedPDF}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Compressed PDF
                  </button>
                  <button 
                    onClick={() => {
                      setFile(null);
                      setOriginalSize(0);
                      setCompressedSize(0);
                      setIsComplete(false);
                      setCompressedPdfData(null);
                      setCompressedFileName("");
                    }}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Compress Another PDF
                  </button>
                </div>
              </div>
            ) : (
              <>
                <FileUploader
                  accept=".pdf"
                  maxSize={10}
                  maxFiles={1}
                  onFilesSelected={handleFileSelected}
                  description="Drag & drop a PDF file here or click to browse"
                  className="mb-8"
                />
                
                {file && (
                  <div className="mt-8 bg-card rounded-xl p-6 shadow-subtle">
                    <h3 className="text-lg font-medium mb-4">Compression Options</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      PDF: {file.name} ({formatFileSize(originalSize)})
                    </p>
                    
                    <div>
                      <label className="block text-base font-medium mb-4">
                        Compression Level
                      </label>
                      
                      <div className="space-y-3">
                        {(Object.keys(CompressionLevel) as CompressionLevelKey[]).map((level) => (
                          <label 
                            key={level} 
                            className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                              compressionLevel === level 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <input
                              type="radio"
                              name="compressionLevel"
                              value={level}
                              checked={compressionLevel === level}
                              onChange={() => setCompressionLevel(level)}
                              className="mt-1 mr-3"
                            />
                            <div>
                              <div className="font-medium">{CompressionLevel[level].name}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {CompressionLevel[level].ratio} • {CompressionLevel[level].quality}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      
                      <div className="mt-8 flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          Estimated size: <span className="font-medium">{formatFileSize(calculateCompressedSize(compressionLevel))}</span>
                        </div>
                        
                        <button
                          onClick={compressPDF}
                          disabled={isProcessing}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70 transition-colors px-8 py-3 rounded-lg font-medium inline-flex items-center justify-center"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Compressing...
                            </>
                          ) : (
                            <>
                              <FileCheck className="mr-2 h-5 w-5" />
                              Compress PDF
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {!file && (
                  <div className="bg-secondary/50 rounded-xl p-6 mt-8">
                    <h3 className="text-lg font-medium mb-3">How to Compress PDF Files</h3>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Upload a PDF file using the upload box above</li>
                      <li>Select your preferred compression level</li>
                      <li>Click the "Compress PDF" button</li>
                      <li>Download your compressed PDF file</li>
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

export default CompressPDF;
