import { useState, useEffect, useCallback } from 'react';
import { fetchAssets, fetchAvailableAssets } from '../services/assetService';

const useAssets = (onlyAvailable = false) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = onlyAvailable
        ? await fetchAvailableAssets()
        : await fetchAssets();
      setAssets(data);
    } catch (err) {
      setError(err.message || 'Gagal memuat data asset.');
    } finally {
      setLoading(false);
    }
  }, [onlyAvailable]);

  useEffect(() => {
    load();
  }, [load]);

  return { assets, loading, error, refresh: load };
};

export default useAssets;