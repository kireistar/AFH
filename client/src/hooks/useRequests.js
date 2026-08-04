import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchAllRequests,
  fetchMyRequests,
  approveRequest,
  rejectRequest,
  returnRequest,
} from '../services/requestService';

const useRequests = (mode = 'all', statusFilter = null) => {
  const [requests, setRequests] = useState([]);
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
      const data = mode === 'mine'
        ? await fetchMyRequests()
        : await fetchAllRequests(statusFilter);

      if (!controller.signal.aborted && mountedRef.current) {
        setRequests(data);
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
          setError(err.message || 'Failed to load requests.');
        }
      }
    } finally {
      if (!controller.signal.aborted && mountedRef.current) {
        setLoading(false);
      }
    }
  }, [mode, statusFilter]);

  useEffect(() => {
    mountedRef.current = true;
    load(true);
    return () => { mountedRef.current = false; };
  }, [load]);

  const approve = async (requestId) => {
    await approveRequest(requestId);
    await load(true);
  };

  const reject = async (requestId, reason) => {
    await rejectRequest(requestId, reason);
    await load(true);
  };

  const returnAsset = async (requestId, conditionNotes = "", returnCondition = null) => {
    await returnRequest(requestId, conditionNotes, returnCondition);
    await load(true);
  };

  const refresh = () => load(false);

  return { requests, loading, error, pollingFailed, refresh, approve, reject, returnAsset };
};

export default useRequests;
