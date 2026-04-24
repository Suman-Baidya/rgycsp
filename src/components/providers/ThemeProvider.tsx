"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Workaround for React 19 warning: "Encountered a script tag while rendering React component"
// This is a known issue with next-themes and React 19 where the FOUC-prevention script 
// triggers a development-only warning.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props} enableColorScheme={false}>
      {children}
    </NextThemesProvider>
  );
}
