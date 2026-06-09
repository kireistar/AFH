import { useState, useEffect, useCallback } from 'react';
import { fetchAllTransactions } from '../services/transactionService';

const useTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAllTransactions();
            setTransactions(data);
        } catch (err) {
            setError(err.message || 'Gagal memuat data transaksi.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return { transactions, loading, error, refresh: load };
};

export default useTransactions;