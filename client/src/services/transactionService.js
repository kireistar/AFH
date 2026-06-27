import { apiGet } from './apiClient';
import { formatStatus, formatCurrency, formatDate } from '../utils/formatters';

/**
 * Mapper: backend transaction object -> format yang dipakai komponen
 */

const mapTransaction = (raw) => ({
    id: raw.transaction_code,
    party: raw.borrower?.employee_name || 'Unknown User',
    asset: raw.asset?.asset_name || 'Unknown Asset',
    date: formatDate(raw.occurred_at),
    action: formatStatus(raw.action),
    amount: raw.payload?.fine_amount ? formatCurrency(raw.payload.fine_amount) : '-',
    status: formatStatus(raw.status),
    _id: raw.id,
    _action: raw.action,
    _status: raw.status,
    previous_hash: raw.previous_hash,
    current_hash: raw.current_hash,
});

export const fetchAllTransactions = async () => {
    const data = await apiGet('/api/v1/transactions/');
    return data.map(mapTransaction);
};

export const verifyLedger = async () => {
    return await apiGet('/api/v1/transactions/verify/ledger');
};