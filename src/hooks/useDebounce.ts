"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a value by a given delay in milliseconds.
 * Prevents excessive calculations, API calls, or state updates on fast typing.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
