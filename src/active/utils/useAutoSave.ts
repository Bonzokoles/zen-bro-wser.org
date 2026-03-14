// src/active/utils/useAutoSave.ts
import { useEffect, useMemo } from 'react';

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}


export function useAutoSave<T>(
  key: string,
  value: T,
  delay = 1000
) {
  const debouncedSave = useMemo(
    () => debounce((val: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (error) {
        console.error("Failed to save to localStorage", error);
      }
    }, delay),
    [key, delay]
  );

  useEffect(() => {
    debouncedSave(value);
  }, [value, debouncedSave]);
}
