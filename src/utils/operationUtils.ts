
import { useCounter } from "@/context/CounterContext";

// Hook to increment the operations counter
export const useTrackOperation = () => {
  const { incrementCounter } = useCounter();
  
  return {
    trackOperation: () => {
      incrementCounter();
    }
  };
};
