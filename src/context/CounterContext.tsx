
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CounterContextType = {
  totalOperations: number;
  incrementCounter: () => void;
};

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export const CounterProvider = ({ children }: { children: ReactNode }) => {
  const [totalOperations, setTotalOperations] = useState<number>(0);

  // Load count from localStorage on initial render
  useEffect(() => {
    const savedCount = localStorage.getItem('totalOperations');
    if (savedCount) {
      setTotalOperations(parseInt(savedCount, 10));
    }
  }, []);

  // Save count to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('totalOperations', totalOperations.toString());
  }, [totalOperations]);

  const incrementCounter = () => {
    setTotalOperations(prev => prev + 1);
  };

  return (
    <CounterContext.Provider value={{ totalOperations, incrementCounter }}>
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
