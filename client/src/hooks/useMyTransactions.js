import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchTransactionsByBorrower } from '../services/transactionService';

const useMyTransactions = (borrowerId) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);

    const load = useCallback(async () => {
        if (!borrowerId) {
            setTransactions([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await fetchTransactionsByBorrower(borrowerId);
            if (mountedRef.current) setTransactions(data || []);
        } catch (err) {
            if (mountedRef.current) setError(err.message || 'Failed to load receipts.');
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, [borrowerId]);

    useEffect(() => {
        mountedRef.current = true;
        load();
        return () => { mountedRef.current = false; };
    }, [load]);

    const refresh = useCallback(() => load(), [load]);

    return { transactions, loading, error, refresh };
};

export default useMyTransactions;
