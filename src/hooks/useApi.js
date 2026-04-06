// src/hooks/useApi.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useApi — fetch data dari backend dengan loading/error state.
 *
 * @param {Function} fetcher — fungsi async yang return data (dari api.js)
 * @param {Array}    deps    — dependency array, seperti useEffect
 *
 * Contoh:
 *   const { data, loading, error, refetch } = useApi(() => tugasApi.list(), []);
 */
export function useApi(fetcher, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // BUG FIX: Gunakan ref untuk melacak apakah komponen masih mounted
  // agar tidak ada setState setelah komponen di-unmount (memory leak / warning)
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) setError(err.message ?? 'Terjadi kesalahan.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}

/**
 * useMutation — untuk POST/PATCH/DELETE dengan loading state.
 *
 * Contoh:
 *   const { mutate, loading, error } = useMutation((data) => tugasApi.create(data));
 *   const result = await mutate({ judul: '...' });
 */
export function useMutation(fn) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // BUG FIX: Gunakan useCallback agar referensi mutate stabil
  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      return { ok: true, data: result };
    } catch (err) {
      const msg = err.message ?? 'Terjadi kesalahan.';
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { mutate, loading, error };
}
