export const borrowerLabel = (t) => {
  const b = t.borrower || {};
  return b.employee_name || b.full_name || b.username || b.name || '-';
};

export const assetLabel = (t) => {
  const a = t.asset || {};
  return typeof a === 'object' && a.asset_name
    ? a.asset_code
      ? `${a.asset_name} (${a.asset_code})`
      : a.asset_name
    : t.asset || '-';
};

export const amountLabel = (t) => {
  const value = t.payload?.fine_amount;
  return value == null ? '-' : `Rp ${Number(value).toLocaleString('id-ID')}`;
};

export const amountValue = (t) => t.payload?.fine_amount ?? null;
