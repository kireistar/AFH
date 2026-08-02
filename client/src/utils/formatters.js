/// Formatters, helper untuk mengubah nilai backend ke format yang siap ditampilkan di UI

/// Ubah string snake_case ke Title Case (contoh: 'pending_admin' → 'Pending Admin')
export const toTitleCase = (str) => {
    if (!str) return '-';
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const formatStatus = toTitleCase;
export const formatCondition = toTitleCase;

/// Format angka Decimal dari backend ke format Rupiah, contoh: 50000 → 'Rp 50.000'
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'Rp 0';
    return 'Rp ' + Number(amount).toLocaleString('id-ID');
};

/// Format ISO datetime string ke format tanggal, contoh: '2024-10-25T08:00:00Z' → 'Oct 25, 2024'
export const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/// Sama seperti formatDate tapi untuk field tipe date (bukan datetime), contoh: '2024-10-25' → 'Oct 25, 2024'
export const formatDateOnly = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};