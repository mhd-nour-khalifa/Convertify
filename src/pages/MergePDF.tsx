import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MoveDown, MoveUp, Trash, Combine, ArrowLeft, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { PDFDocument } from 'pdf-lib';
import { useCounter } from "@/context/CounterContext";
import { toast } from "sonner";

const MergePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const { toast: uiToast } = useToast();
  const { incrementCounter } = useCounter();

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setMergedPdfUrl(null);
  };

  const moveFileUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[index - 1];
    newFiles[index - 1] = temp;
    setFiles(newFiles);
  };

  const moveFileDown = (index: number) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[index + 1];
    newFiles[index + 1] = temp;
    setFiles(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast({
        description: "You need at least 2 PDF files to merge"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        try {
          const fileArrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(fileArrayBuffer);
          const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          copiedPages.forEach(page => {
            mergedPdf.addPage(page);
          });
          console.log(`Successfully added ${copiedPages.length} pages from ${file.name}`);
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          toast({
            description: `Could not process ${file.name}. The file might be corrupted or password-protected.`,
            variant: "destructive"
          });
        }
      }
      
      if (mergedPdf.getPageCount() === 0) {
        throw new Error("No valid pages were found in the provided PDF files");
      }
      
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setMergedPdfUrl(url);
      setIsComplete(true);
      toast({
        description: `Combined ${mergedPdf.getPageCount()} pages from ${files.length} PDF files.`
      });
      
      incrementCounter();
    } catch (error) {
      console.error("PDF merge error:", error);
      toast({
        description: "Failed to merge PDF files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadMergedPDF = () => {
    if (!mergedPdfUrl) {
      toast({
        description: "No merged PDF available to download.",
        variant: "destructive"
      });
      return;
    }

    const downloadLink = document.createElement("a");
    const filename = files.length > 0 
      ? `merged-${files[0].name.split('.')[0]}.pdf` 
      : "merged-document.pdf";
    
    downloadLink.href = mergedPdfUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    toast({
      description: "Your merged PDF is downloading."
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
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
            <span className="text-foreground font-medium">Merge PDF</span>
          </nav>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Merge PDF Files</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Combine multiple PDF documents into a single file, in the order you want
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {isComplete ? (
              <div className="bg-card rounded-xl p-8 shadow-lg border border-gray-100 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Combine className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Your PDFs Have Been Merged!</h2>
                <p className="text-muted-foreground mb-8">
                  All {files.length} PDF files have been successfully combined into a single document.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    onClick={downloadMergedPDF}
                    variant="default"
                    size="lg"
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transition-all duration-300 shadow-md"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Merged PDF
                  </Button>
                  <Button 
                    onClick={() => {
                      setFiles([]);
                      setIsComplete(false);
                      setMergedPdfUrl(null);
                    }}
                    variant="outline"
                    size="lg"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Merge Another PDF
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <FileUploader
                  accept=".pdf"
                  maxSize={10}
                  maxFiles={10}
                  onFilesSelected={handleFilesSelected}
                  description="Drag & drop PDF files here or click to browse"
                  className="mb-8"
                />
                
                {files.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">File Order (Drag to Reorder)</h3>
                    <div className="space-y-3 mb-8">
                      {files.map((file, index) => (
                        <div 
                          key={index} 
                          className="flex items-center bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                          <span className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full text-primary font-medium">{index + 1}</span>
                          <div className="ml-4 flex-grow truncate">{file.name}</div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => moveFileUp(index)}
                              disabled={index === 0}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
                            >
                              <MoveUp size={18} />
                            </Button>
                            <Button
                              onClick={() => moveFileDown(index)}
                              disabled={index === files.length - 1}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-30"
                            >
                              <MoveDown size={18} />
                            </Button>
                            <Button
                              onClick={() => removeFile(index)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                            >
                              <Trash size={18} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-center">
                      <Button
                        onClick={mergePDFs}
                        disabled={files.length < 2 || isProcessing}
                        variant="default"
                        size="lg"
                        className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transition-all duration-300 shadow-md"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Combine className="mr-2 h-5 w-5" />
                            Merge PDFs
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                
                {files.length === 0 && (
                  <div className="bg-white/50 rounded-xl p-6 mt-8 border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold mb-3">How to Merge PDF Files</h3>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Upload two or more PDF files using the upload box above</li>
                      <li>Rearrange the files in your desired order using the up/down buttons</li>
                      <li>Click the "Merge PDFs" button</li>
                      <li>Download your merged PDF document</li>
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

export default MergePDF;
