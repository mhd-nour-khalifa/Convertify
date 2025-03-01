import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, RotateCcw, RotateCw, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PDFDocument, degrees } from "pdf-lib";

type RotationDegree = "90" | "180" | "270";

const RotatePDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [rotationDegree, setRotationDegree] = useState<RotationDegree>("90");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [rotatedPdfUrl, setRotatedPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    setFile(files[0]);
    setIsComplete(false);
    cleanupObjectUrl();
  };

  const handleRotate = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF file first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const fileArrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileArrayBuffer);
      
      const pageCount = pdfDoc.getPageCount();
      
      const rotateAngle = parseInt(rotationDegree);
      
      for (let i = 0; i < pageCount; i++) {
        const page = pdfDoc.getPage(i);
        page.setRotation(degrees(rotateAngle));
      }
      
      const pdfBytes = await pdfDoc.save();
      
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setRotatedPdfUrl(pdfUrl);
      
      setIsProcessing(false);
      setIsComplete(true);
      
      toast({
        title: "PDF Rotated Successfully!",
        description: `Your PDF has been rotated ${rotationDegree} degrees.`,
      });
    } catch (error) {
      console.error("Error rotating PDF:", error);
      setIsProcessing(false);
      
      toast({
        title: "Error Rotating PDF",
        description: "There was a problem rotating your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadRotatedPDF = () => {
    if (!rotatedPdfUrl) {
      toast({
        title: "Error",
        description: "Rotated PDF not available. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    const link = document.createElement('a');
    link.href = rotatedPdfUrl;
    link.download = file ? `rotated_${file.name}` : 'rotated_document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your rotated PDF is downloading."
    });
  };
  
  const resetState = () => {
    setFile(null);
    setIsComplete(false);
    cleanupObjectUrl();
  };
  
  const cleanupObjectUrl = () => {
    if (rotatedPdfUrl) {
      URL.revokeObjectURL(rotatedPdfUrl);
      setRotatedPdfUrl(null);
    }
  };
  
  useEffect(() => {
    return () => cleanupObjectUrl();
  }, [rotatedPdfUrl]);

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
            <span className="text-foreground font-medium">Rotate PDF</span>
          </nav>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold mb-4">Rotate PDF Pages</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Change the orientation of your PDF pages quickly and easily
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {isComplete ? (
              <div className="bg-card rounded-xl p-8 shadow-subtle text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RotateCcw className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-medium mb-4">Your PDF Has Been Rotated!</h2>
                <p className="text-muted-foreground mb-8">
                  Your PDF has been successfully rotated {rotationDegree} degrees.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    onClick={downloadRotatedPDF}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Rotated PDF
                  </Button>
                  <Button 
                    onClick={resetState}
                    variant="outline"
                  >
                    Rotate Another PDF
                  </Button>
                </div>
              </div>
            ) : (
              <>
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
                      <h3 className="text-xl font-medium mb-6">Select Rotation Angle</h3>
                      
                      <div className="space-y-6 max-w-md mx-auto">
                        <RadioGroup 
                          value={rotationDegree} 
                          onValueChange={(value) => setRotationDegree(value as RotationDegree)}
                          className="flex justify-center gap-8"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="bg-secondary p-4 rounded-lg flex items-center justify-center">
                              <RotateCw className="h-10 w-10 text-primary" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="90" id="r90" />
                              <Label htmlFor="r90">90° Clockwise</Label>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center gap-2">
                            <div className="bg-secondary p-4 rounded-lg flex items-center justify-center">
                              <RotateCw className="h-10 w-10 text-primary transform rotate-90" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="180" id="r180" />
                              <Label htmlFor="r180">180° Rotation</Label>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center gap-2">
                            <div className="bg-secondary p-4 rounded-lg flex items-center justify-center">
                              <RotateCcw className="h-10 w-10 text-primary" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="270" id="r270" />
                              <Label htmlFor="r270">270° Clockwise</Label>
                            </div>
                          </div>
                        </RadioGroup>
                        
                        <Button
                          onClick={handleRotate}
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
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Rotate PDF
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {!file && (
                  <div className="bg-secondary/50 rounded-xl p-6 mt-8">
                    <h3 className="text-lg font-medium mb-3">How to Rotate a PDF</h3>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Upload your PDF file using the upload box above</li>
                      <li>Select the desired rotation angle (90°, 180°, or 270°)</li>
                      <li>Click the "Rotate PDF" button</li>
                      <li>Download your rotated PDF document</li>
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

export default RotatePDF;
