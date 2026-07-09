"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type LoadingContextType = {
  isLoaded: boolean;
  completeLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType>({
  isLoaded: false,
  completeLoading: () => {},
});

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const completeLoading = () => setIsLoaded(true);

  return (
    <LoadingContext.Provider value={{ isLoaded, completeLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext).isLoaded;
}

export function useLoadingControls() {
  return useContext(LoadingContext);
}
