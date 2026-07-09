"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const LoadingContext = createContext(false);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingContext.Provider value={isLoaded}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
