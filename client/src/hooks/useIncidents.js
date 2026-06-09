import { useState, useEffect, useCallback } from 'react';
import { fetchAllIncidents } from '../services/incidentService';

const useIncidents = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAllIncidents();
            setIncidents(data);
        } catch (err) {
            setError(err.message || 'Failed to load incidents');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return { incidents, loading, error, refresh: load };
};

export default useIncidents;