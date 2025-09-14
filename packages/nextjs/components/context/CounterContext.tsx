"use client";

import { createContext, useContext } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";

type CounterContextType = {
  counterValue: number;
  isLoading: boolean;
  error: Error | null;
}

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export const CounterProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: counterValue, isLoading, error } = useScaffoldReadContract({
    contractName: "CounterContract",
    functionName: "get_counter",
  });

  const currentCounterValue = Number(counterValue) || 0;

  return (
    <CounterContext.Provider value={{ counterValue: currentCounterValue, isLoading, error }}>
      {children}
    </CounterContext.Provider>
  );
};

export const useCounterContext = () => {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error("useCounterContext must be used within a CounterProvider");
  }
  return context;
}