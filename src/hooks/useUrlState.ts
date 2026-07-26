import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useUrlState(key: string, defaultValue: string = '') {
  const searchParams = useSearchParams();

  const [value, setValue] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const val = params.get(key);
      return val !== null ? val : defaultValue;
    }
    const val = searchParams?.get(key);
    return val !== null && val !== undefined ? val : defaultValue;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const val = params.get(key);
    setValue(val !== null ? val : defaultValue);
  }, [searchParams, key, defaultValue]);

  const setUrlState = useCallback(
    (newValue: string) => {
      setValue(newValue);
      
      const url = new URL(window.location.href);
      if (newValue) {
        url.searchParams.set(key, newValue);
      } else {
        url.searchParams.delete(key);
      }
      window.history.replaceState(null, '', url.toString());
    },
    [key]
  );

  return [value, setUrlState] as const;
}
