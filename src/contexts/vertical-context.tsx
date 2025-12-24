"use client";

import { createContext, useContext } from "react";

export type Vertical = "eat" | "market";

interface VerticalContextType {
  vertical: Vertical;
  isEat: boolean;
  isMarket: boolean;
}

const VerticalContext = createContext<VerticalContextType>({
  vertical: "eat",
  isEat: true,
  isMarket: false,
});

export function VerticalProvider({
  vertical,
  children,
}: {
  vertical: Vertical;
  children: React.ReactNode;
}) {
  const value: VerticalContextType = {
    vertical,
    isEat: vertical === "eat",
    isMarket: vertical === "market",
  };

  return (
    <VerticalContext.Provider value={value}>
      {children}
    </VerticalContext.Provider>
  );
}

export function useVertical() {
  // Context always has a value due to default, no null check needed
  return useContext(VerticalContext);
}
