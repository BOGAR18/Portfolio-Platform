import { useEffect, useState } from 'react';

// Menunda update nilai. Dipakai agar search tidak memanggil API di setiap ketukan.
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}