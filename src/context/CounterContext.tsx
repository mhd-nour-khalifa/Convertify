
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

type CounterContextType = {
  totalOperations: number;
  incrementCounter: () => void;
  resetCounter: () => void;
};

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export const CounterProvider = ({ children }: { children: ReactNode }) => {
  const [totalOperations, setTotalOperations] = useState<number>(0);

  // Load count from localStorage on initial render
  useEffect(() => {
    try {
      const savedCount = localStorage.getItem('totalOperations');
      if (savedCount) {
        setTotalOperations(parseInt(savedCount, 10));
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      // If localStorage fails, at least initialize with 0
      setTotalOperations(0);
    }
  }, []);

  // Save count to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('totalOperations', totalOperations.toString());
    } catch (error) {
      console.error("Error writing to localStorage:", error);
      toast("Unable to save operation count");
    }
  }, [totalOperations]);

  const incrementCounter = () => {
    console.log("Incrementing operation counter");
    setTotalOperations(prev => {
      const newCount = prev + 1;
      return newCount;
    });
  };
  
  const resetCounter = () => {
    setTotalOperations(0);
  };

  return (
    <CounterContext.Provider value={{ totalOperations, incrementCounter, resetCounter }}>
      {children}
    </CounterContext.Provider>
  );
};

export const useCounter = (): CounterContextType => {
  const context = useContext(CounterContext);
  if (context === undefined) {
    throw new Error('useCounter must be used within a CounterProvider');
  }
  return context;
};
