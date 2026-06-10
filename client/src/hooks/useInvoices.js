import { useState, useEffect, useCallback } from 'react';
import { fetchAllInvoices, verifyPayment } from '../services/invoiceService';

const useInvoices = (statusFilter = null) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllInvoices(statusFilter);
      setInvoices(data);
    } catch (err) {
      setError(err.message || 'Gagal memuat data invoice.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const markAsPaid = async (invoiceId, paymentMethod = 'bank_transfer') => {
    try {
      await verifyPayment(invoiceId, paymentMethod);
      await load(); // refresh list setelah aksi
    } catch (err) {
      setError(err.message || 'Gagal memverifikasi pembayaran.');
    }
  };

  return { invoices, loading, error, refresh: load, markAsPaid };
};

export default useInvoices;