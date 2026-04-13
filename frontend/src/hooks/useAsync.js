import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useAsync — generic data-fetching hook
 * @param {Function} fetcher  async fn returning data
 * @param {Array}    deps     re-run when these change
 */
export function useAsync(fetcher, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const mounted = useRef(true);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mounted.current) { setData(result); setError(null); }
    } catch (err) {
      if (mounted.current) { setError(err.message || "Unknown error"); setData(null); }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mounted.current = true;
    run();
    return () => { mounted.current = false; };
  }, [run]);

  return { data, loading, error, refetch: run };
}

/**
 * useDebounce — debounces a value by `delay` ms
 */
export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
