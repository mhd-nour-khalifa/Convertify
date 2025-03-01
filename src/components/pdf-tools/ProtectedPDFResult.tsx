
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedPDFResultProps {
  onDownload: () => void;
  onReset: () => void;
}

const ProtectedPDFResult = ({ onDownload, onReset }: ProtectedPDFResultProps) => {
  return (
    <div className="bg-card rounded-xl p-8 shadow-subtle text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-medium mb-4">Your PDF is Ready!</h2>
      <p className="text-muted-foreground mb-2">
        Your PDF has been processed and is ready for download.
      </p>
      <p className="text-amber-500 mb-8 text-sm">
        Note: Due to browser limitations, this PDF is not truly encrypted with a password.
        For proper PDF encryption, server-side processing would be required.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          onClick={onDownload}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Download Processed PDF
        </Button>
        <Button 
          onClick={onReset}
          variant="outline"
        >
          Process Another PDF
        </Button>
      </div>
    </div>
  );
};

export default ProtectedPDFResult;
