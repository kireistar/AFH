import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAssets, fetchAvailableAssets } from '../services/assetService';

const useAssets = (onlyAvailable = false) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pollingFailed, setPollingFailed] = useState(false);
  const abortRef = useRef(null);
  const mountedRef = useRef(true);
  const failureCountRef = useRef(0);

  const load = useCallback(async (isInitial = false) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (isInitial) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = onlyAvailable
        ? await fetchAvailableAssets()
        : await fetchAssets();
      if (!controller.signal.aborted && mountedRef.current) {
        setAssets(data);
        failureCountRef.current = 0;
        setPollingFailed(false);
      }
    } catch (err) {
      if (!controller.signal.aborted && mountedRef.current) {
        failureCountRef.current += 1;
        if (failureCountRef.current >= 3) {
          setPollingFailed(true);
        }
        if (isInitial) {
          setError(err.message || 'Failed to load assets.');
        }
      }
    } finally {
      if (!controller.signal.aborted && mountedRef.current) {
        setLoading(false);
      }
    }
  }, [onlyAvailable]);

  useEffect(() => {
    mountedRef.current = true;
    load(true);
    return () => { mountedRef.current = false; };
  }, [load]);

  const refresh = () => load(false);

  return { assets, loading, error, pollingFailed, refresh };
};

export default useAssets;
