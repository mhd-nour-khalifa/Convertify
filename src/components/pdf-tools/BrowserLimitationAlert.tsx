
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const BrowserLimitationAlert = () => {
  return (
    <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-600 dark:text-amber-400">Browser Limitation</AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        Due to browser limitations, true PDF encryption requires server-side processing. 
        This demo will process your PDF but cannot add true password protection in the browser.
      </AlertDescription>
    </Alert>
  );
};

export default BrowserLimitationAlert;
