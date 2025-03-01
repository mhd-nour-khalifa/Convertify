
import { useEffect } from "react";
import { useTrackOperation } from "@/utils/operationUtils";

interface CreatePDFCounterProps {
  hasGeneratedPDF: boolean;
}

// This component will increment the counter when a PDF is successfully created
const CreatePDFCounter = ({ hasGeneratedPDF }: CreatePDFCounterProps) => {
  const { trackOperation } = useTrackOperation();
  
  useEffect(() => {
    if (hasGeneratedPDF) {
      trackOperation();
    }
  }, [hasGeneratedPDF, trackOperation]);
  
  return null; // This component doesn't render anything
};

export default CreatePDFCounter;
