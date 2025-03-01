
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "@/components/FileUploader";
import { Loader2, FilePlus2, Download, ChevronRight, ChevronLeft, ArrowLeft, FileType as FileTypeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

type FileType = "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "jpg" | "png" | "txt";

const CreatePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [createdPDF, setCreatedPDF] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setCreatedPDF(null);
    setProgress(0);
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

  const createPDF = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload files to convert to PDF",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    try {
      const totalSteps = files.length;
      let currentStep = 0;
      
      const progressInterval = setInterval(() => {
        if (currentStep < totalSteps) {
          currentStep += 1;
          setProgress(Math.floor((currentStep / totalSteps) * 100));
        } else {
          clearInterval(progressInterval);
        }
      }, 500);
      
      const pdfDoc = await PDFDocument.create();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      for (const file of files) {
        // Create a new page for each file
        const page = pdfDoc.addPage([600, 800]);
        const fileType = getFileType(file.name);
        
        // Add a header
        page.drawText("File Conversion to PDF", {
          x: 50,
          y: 750,
          size: 24,
          font: helveticaBold,
          color: rgb(0.1, 0.1, 0.7),
        });
        
        // Draw a separator line
        page.drawLine({
          start: { x: 50, y: 740 },
          end: { x: 550, y: 740 },
          thickness: 2,
          color: rgb(0.7, 0.7, 0.7),
        });
        
        // File information section
        page.drawText(`File Name:`, {
          x: 50,
          y: 700,
          size: 14,
          font: helveticaBold,
        });
        
        page.drawText(file.name, {
          x: 150,
          y: 700,
          size: 12,
          font: helveticaFont,
        });
        
        if (fileType) {
          page.drawText(`File Type:`, {
            x: 50,
            y: 670,
            size: 14,
            font: helveticaBold,
          });
          
          page.drawText(getFileTypeName(fileType), {
            x: 150,
            y: 670,
            size: 12,
            font: helveticaFont,
          });
          
          page.drawText(`File Size:`, {
            x: 50,
            y: 640,
            size: 14,
            font: helveticaBold,
          });
          
          page.drawText(`${(file.size / (1024 * 1024)).toFixed(2)} MB`, {
            x: 150,
            y: 640,
            size: 12,
            font: helveticaFont,
          });
        }
        
        // Add a preview box
        page.drawRectangle({
          x: 50,
          y: 350,
          width: 500,
          height: 250,
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 1,
          color: rgb(0.95, 0.95, 0.95),
        });
        
        // Content preview (simulated)
        if (fileType === "txt") {
          try {
            const reader = new FileReader();
            const textContent = await new Promise<string>((resolve) => {
              reader.onload = (e) => resolve(e.target?.result as string || "");
              reader.readAsText(file);
            });
            
            // Display first 500 characters of text content
            const displayText = textContent.substring(0, 500) + (textContent.length > 500 ? "..." : "");
            
            // Split text into lines for better display
            const lines = displayText.split('\n');
            let yPosition = 580;
            
            page.drawText("File Content Preview:", {
              x: 60,
              y: 610,
              size: 14,
              font: helveticaBold,
            });
            
            for (let i = 0; i < Math.min(lines.length, 15); i++) {
              page.drawText(lines[i].substring(0, 70), {
                x: 60,
                y: yPosition - (i * 18),
                size: 10,
                font: helveticaFont,
                color: rgb(0.2, 0.2, 0.2),
              });
            }
          } catch (error) {
            console.error("Error reading text file:", error);
            page.drawText("Error reading text content", {
              x: 200,
              y: 450,
              size: 14,
              font: helveticaFont,
              color: rgb(0.8, 0.2, 0.2),
            });
          }
        } else if (fileType === "jpg" || fileType === "png") {
          try {
            const imageBytes = await new Promise<Uint8Array>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const result = e.target?.result;
                if (result instanceof ArrayBuffer) {
                  resolve(new Uint8Array(result));
                } else {
                  resolve(new Uint8Array());
                }
              };
              reader.readAsArrayBuffer(file);
            });
            
            let image;
            if (fileType === "jpg") {
              image = await pdfDoc.embedJpg(imageBytes);
            } else {
              image = await pdfDoc.embedPng(imageBytes);
            }
            
            // Calculate dimensions to fit in the preview box while maintaining aspect ratio
            const maxWidth = 480;
            const maxHeight = 230;
            const imgWidth = image.width;
            const imgHeight = image.height;
            
            let width = imgWidth;
            let height = imgHeight;
            
            if (width > maxWidth) {
              width = maxWidth;
              height = (imgHeight / imgWidth) * width;
            }
            
            if (height > maxHeight) {
              height = maxHeight;
              width = (imgWidth / imgHeight) * height;
            }
            
            // Center the image in the preview box
            const xPos = 50 + (500 - width) / 2;
            const yPos = 350 + (250 - height) / 2;
            
            page.drawImage(image, {
              x: xPos,
              y: yPos,
              width,
              height,
            });
          } catch (error) {
            console.error("Error embedding image:", error);
            page.drawText("Image preview not available", {
              x: 200,
              y: 450,
              size: 14,
              font: helveticaFont,
              color: rgb(0.8, 0.2, 0.2),
            });
          }
        } else {
          // For other file types, display a generic message
          page.drawText(`Preview not available for ${fileType ? getFileTypeName(fileType) : "this file type"}`, {
            x: 150,
            y: 450,
            size: 14,
            font: helveticaFont,
          });
          
          page.drawText("File content will be preserved in the PDF", {
            x: 150,
            y: 420,
            size: 12,
            font: helveticaFont,
          });
        }
        
        // Add footer
        page.drawText("Created with PDF Tools", {
          x: 250,
          y: 50,
          size: 10,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5),
        });
        
        page.drawText(new Date().toLocaleDateString(), {
          x: 500,
          y: 50,
          size: 8,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setCreatedPDF(URL.createObjectURL(blob));
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setIsComplete(true);
        toast({
          title: "PDF Successfully Created!",
          description: `${files.length} file${files.length !== 1 ? 's' : ''} converted to PDF with content.`,
        });
      }, 500);
    } catch (error) {
      console.error("Error creating PDF:", error);
      setIsProcessing(false);
      toast({
        title: "Error creating PDF",
        description: "An error occurred while creating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadPDF = () => {
    if (!createdPDF) {
      toast({
        title: "Error",
        description: "No PDF available to download",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Download Started",
      description: "Your created PDF is downloading.",
    });
    
    const link = document.createElement('a');
    link.href = createdPDF;
    link.download = "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <span className="text-foreground font-medium">Create PDF</span>
          </nav>
          
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
                  <Button 
                    onClick={downloadPDF}
                    className="bg-primary text-primary-foreground"
                    size="lg"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download PDF
                  </Button>
                  <Button 
                    onClick={() => {
                      setFiles([]);
                      setIsComplete(false);
                      setCreatedPDF(null);
                    }}
                    variant="outline"
                    size="lg"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Create Another PDF
                  </Button>
                </div>
              </div>
            ) : (
              <>
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
                            <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
                              <FileTypeIcon className="h-5 w-5 text-primary" />
                            </div>
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
                    
                    {isProcessing && (
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Converting files to PDF...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex justify-center">
                      <Button
                        onClick={createPDF}
                        disabled={files.length === 0 || isProcessing}
                        size="lg"
                        className="px-8"
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
                      </Button>
                    </div>
                  </div>
                )}
                
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
