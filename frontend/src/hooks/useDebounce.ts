import { useEffect, useState } from 'react';

/**
 * Return `value` delayed by `delayMs` — use for search inputs, filter
 * expressions, and anything that shouldn't fire on every keystroke.
 *
 * @example
 * const debounced = useDebounce(search, 250);
 * useEffect(() => fetchResults(debounced), [debounced]);
 */
export function useDebounce<T>(value: T, delayMs: number = 250): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
