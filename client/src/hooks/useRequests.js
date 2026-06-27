import { useState, useEffect, useCallback } from 'react';
import {
  fetchAllRequests,
  fetchMyRequests,
  approveRequest,
  rejectRequest,
  returnRequest,
} from '../services/requestService';

const useRequests = (mode = 'all', statusFilter = null) => {
  // mode: 'all' untuk admin/manager, 'mine' untuk user
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = mode === 'mine'
        ? await fetchMyRequests()
        : await fetchAllRequests(statusFilter);
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Gagal memuat data request.');
    } finally {
      setLoading(false);
    }
  }, [mode, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (requestId) => {
    try {
      await approveRequest(requestId);
      await load(); // refresh list setelah aksi
    } catch (err) {
      setError(err.message || 'Gagal approve request.');
    }
  };

  const reject = async (requestId, reason) => {
    try {
      await rejectRequest(requestId, reason);
      await load();
    } catch (err) {
      setError(err.message || 'Gagal reject request.');
    }
  };

  const returnAsset = async (requestId, conditionNotes = "") => {
    try {
      await returnRequest(requestId, conditionNotes);
      await load();
    } catch (err) {
      setError(err.message || 'Gagal memproses pengembalian asset.');
    }
  };

  return { requests, loading, error, refresh: load, approve, reject, returnAsset };
};

export default useRequests;