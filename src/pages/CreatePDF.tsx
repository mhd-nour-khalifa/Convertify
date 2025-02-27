
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "@/components/FileUploader";
import { Loader2, FilePlus2, Download, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type FileType = "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "jpg" | "png" | "txt";

const CreatePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [createdPDF, setCreatedPDF] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setCreatedPDF(null);
  };

  const getFileType = (filename: string): FileType | null => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (extension === "doc" || extension === "docx") return "doc";
    if (extension === "xls" || extension === "xlsx") return "xls";
    if (extension === "ppt" || extension === "pptx") return "ppt";
    if (extension === "jpg" || extension === "jpeg") return "jpg";
    if (extension === "png") return "png";
    if (extension === "txt") return "txt";
    return null;
  };

  const getFileTypeName = (type: FileType): string => {
    switch (type) {
      case "doc":
      case "docx":
        return "Word Document";
      case "xls":
      case "xlsx":
        return "Excel Spreadsheet";
      case "ppt":
      case "pptx":
        return "PowerPoint Presentation";
      case "jpg":
        return "JPEG Image";
      case "png":
        return "PNG Image";
      case "txt":
        return "Text Document";
    }
  };

  const createPDF = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload files to convert to PDF",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      // In a real app, this would be the actual PDF creation process
      // For demo purposes, we'll just simulate success
      setCreatedPDF("document.pdf");
      setIsProcessing(false);
      setIsComplete(true);
      toast({
        title: "PDF Successfully Created!",
        description: `${files.length} file${files.length !== 1 ? 's' : ''} converted to PDF.`,
      });
    }, 2000);
  };

  const downloadPDF = () => {
    toast({
      title: "Download Started",
      description: "Your created PDF is downloading.",
    });
    // In a real app, this would be a link to download the created PDF file
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
            <span className="text-foreground font-medium">Create PDF</span>
          </nav>
          
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold mb-4">Create PDF Files</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Convert documents, presentations, spreadsheets and images to PDF format
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {isComplete ? (
              <div className="bg-card rounded-xl p-8 shadow-subtle text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FilePlus2 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-medium mb-4">Your PDF Has Been Created!</h2>
                <p className="text-muted-foreground mb-8">
                  {files.length} file{files.length !== 1 ? 's' : ''} successfully converted to PDF format.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={downloadPDF}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download PDF
                  </button>
                  <button 
                    onClick={() => {
                      setFiles([]);
                      setIsComplete(false);
                      setCreatedPDF(null);
                    }}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Create Another PDF
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* File Uploader */}
                <FileUploader
                  accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
                  maxSize={10}
                  maxFiles={10}
                  onFilesSelected={handleFilesSelected}
                  description="Drag & drop files here or click to browse"
                  className="mb-8"
                />
                
                {files.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Files to Convert</h3>
                    <div className="space-y-3 mb-8">
                      {files.map((file, index) => {
                        const fileType = getFileType(file.name);
                        return (
                          <div 
                            key={index} 
                            className="flex items-center bg-card rounded-lg p-4 shadow-sm"
                          >
                            <div className="ml-4 flex-grow">
                              <div className="font-medium truncate">{file.name}</div>
                              {fileType && (
                                <div className="text-sm text-muted-foreground">
                                  {getFileTypeName(fileType)} • {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex justify-center">
                      <button
                        onClick={createPDF}
                        disabled={files.length === 0 || isProcessing}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70 transition-colors px-8 py-3 rounded-lg font-medium inline-flex items-center justify-center"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FilePlus2 className="mr-2 h-5 w-5" />
                            Create PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Instructions */}
                {files.length === 0 && (
                  <div className="bg-secondary/50 rounded-xl p-6 mt-8">
                    <h3 className="text-lg font-medium mb-3">How to Create PDF Files</h3>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Upload one or more files using the upload box above</li>
                      <li>Supported formats include Word, Excel, PowerPoint, images, and text files</li>
                      <li>Click the "Create PDF" button</li>
                      <li>Download your newly created PDF document</li>
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

export default CreatePDF;
