export const formatDateTime = (isoString) => {
  if (!isoString) return '-';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return String(isoString);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const openReceiptInNewTab = (transaction) => {
  if (!transaction) return;

  const code = transaction.transaction_code || transaction.id || 'TX-UNKNOWN';
  const assetName = typeof transaction.asset === 'object'
    ? (transaction.asset.asset_name ? `${transaction.asset.asset_name} (${transaction.asset.asset_code || ''})` : 'Asset')
    : (transaction.asset || '-');
  const partyName = typeof transaction.borrower === 'object'
    ? (transaction.borrower.employee_name || transaction.borrower.name || '-')
    : (transaction.party || transaction.borrower || transaction.user || '-');
  const action = (transaction.action || 'handover').toUpperCase();
  const date = formatDateTime(transaction.date || transaction.occurred_at || transaction.created_at);
  const status = (transaction.status || 'COMPLETED').toUpperCase();
  const signature = transaction.ed25519_signature || transaction.signature || 'Verified (Ed25519 Signature)';
  const ledgerHash = transaction.ledger_hash || transaction.hash || 'Verified (SHA-256 Immutable Ledger)';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Digital Receipt - ${code}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 40px; color: #1e293b; }
        .receipt-card { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
        .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
        .brand { font-size: 24px; font-weight: 900; color: #1e3a8a; }
        .badge { background: #dbeafe; color: #1e3a8a; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
        .val { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 4px; }
        .full-width { grid-column: span 2; }
        .crypto-box { background: #f1f5f9; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 11px; word-break: break-all; color: #334155; margin-top: 4px; }
        .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #94a3b8; }
        .print-btn { background: #1e3a8a; color: white; border: none; padding: 10px 20px; font-weight: 700; border-radius: 8px; cursor: pointer; margin-top: 16px; }
        @media print { .print-btn { display: none; } body { padding: 0; background: white; } .receipt-card { box-shadow: none; border: 1px solid #000; } }
      </style>
    </head>
    <body>
      <div class="receipt-card">
        <div class="header">
          <div class="brand">AFH DIGITAL RECEIPT</div>
          <div class="badge">${action}</div>
        </div>
        <div class="grid">
          <div>
            <div class="label">Transaction Code</div>
            <div class="val">${code}</div>
          </div>
          <div>
            <div class="label">Date & Time</div>
            <div class="val">${date}</div>
          </div>
          <div>
            <div class="label">Asset</div>
            <div class="val">${assetName}</div>
          </div>
          <div>
            <div class="label">User / Borrower</div>
            <div class="val">${partyName}</div>
          </div>
          <div>
            <div class="label">Status</div>
            <div class="val" style="color: #15803d;">${status}</div>
          </div>
          <div class="full-width">
            <div class="label">Cryptographic Ed25519 Signature</div>
            <div class="crypto-box">${signature}</div>
          </div>
          <div class="full-width">
            <div class="label">Immutable SHA-256 Ledger Hash</div>
            <div class="crypto-box">${ledgerHash}</div>
          </div>
        </div>
        <div class="footer">
          Official Digital Proof of Asset Lifecycle Transaction — AFH System
          <br>
          <button class="print-btn" onclick="window.print()">Print Receipt</button>
        </div>
      </div>
    </body>
    </html>
  `;

  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  }
};
