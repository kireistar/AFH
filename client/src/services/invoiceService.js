import { apiGet, apiPatch } from './apiClient';
import { formatStatus, formatCurrency, formatDate } from '../utils/formatters';

/**
 * Mapper: backend Invoice object → format yang dipakai komponen
 */
const mapInvoice = (raw) => ({
  id: raw.invoice_code,
  user: raw.user?.employee_name || 'Unknown User',
  reason: raw.reason,
  amount: formatCurrency(raw.fine_amount),  // 'Rp 50.000'
  status: formatStatus(raw.status),          // 'Unpaid' / 'Paid'
  dueDate: raw.due_date ? formatDate(raw.due_date) : '-',
  paidAt: raw.paid_at ? formatDate(raw.paid_at) : null,
  _id: raw.id,          // integer id asli
  _status: raw.status,  // status raw untuk logic kondisional
  _rawAmount: raw.fine_amount,  // angka asli kalau perlu kalkulasi
});

export const fetchAllInvoices = async (statusFilter = null) => {
  const url = statusFilter
    ? `/api/v1/invoices/?status_filter=${statusFilter}`
    : '/api/v1/invoices/';
  const data = await apiGet(url);
  return data.map(mapInvoice);
};

export const verifyPayment = async (invoiceId, paymentMethod = 'bank_transfer') => {
  const data = await apiPatch(
    `/api/v1/invoices/${invoiceId}/verify-payment?payment_method=${paymentMethod}`
  );
  return mapInvoice(data);
};