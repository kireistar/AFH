export function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatSignature(signature) {
  if (!signature) return { borrower_sig: null, admin_sig: null };
  try {
    const parsed = JSON.parse(signature);
    if (parsed && (parsed.borrower_sig || parsed.admin_sig)) return parsed;
  } catch {
    // fall through: bare single signature (manual flow)
  }
  return { borrower_sig: null, admin_sig: signature };
}

export function shortHash(hash) {
  if (!hash) return "-";
  return hash.length > 32 ? `${hash.slice(0, 16)}...${hash.slice(-8)}` : hash;
}

export function getReceiptFields(receipt) {
  if (!receipt) return null;
  const sig = formatSignature(receipt.signature);
  return {
    receipt,
    sig,
    borrower: receipt.borrower || {},
    asset: receipt.asset || {},
    admin: receipt.admin || {},
    notes: receipt.payload?.notes || receipt.payload?.reason,
    publicKey: receipt.payload?.public_key || receipt.borrower?.public_key,
  };
}

function getReceiptRowData(receipt) {
  const fields = getReceiptFields(receipt);
  const asset = fields.asset;
  const borrower = fields.borrower;
  const admin = fields.admin;
  return [
    ["Status", receipt.status || "completed"],
    ["Date & Time", formatDateTime(receipt.occurred_at || receipt.created_at)],
    ["Asset", asset.asset_name || "-"],
    ["Asset Code / Serial", `${asset.asset_code || "-"} / ${asset.serial_number || "-"}`],
    ["Borrower", borrower.employee_name || "-"],
    ["Department", borrower.department || "-"],
    ["Admin / Issuer", admin.employee_name || "-"],
    ["Admin Department", admin.department || "-"],
  ];
}

const escapeHtml = (value) => String(value ?? "-")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

function buildRows(fields) {
  return getReceiptRowData(fields.receipt).map(
    ([k, v]) => `<div class="row"><span class="k">${escapeHtml(k)}</span><span class="v">${escapeHtml(v)}</span></div>`
  ).join("");
}

export function buildReceiptHtml(receipt) {
  const fields = getReceiptFields(receipt);
  if (!fields) return "";

  const code = receipt.transaction_code || `TX-${receipt.id || "-"}`;
  const hash = receipt.current_hash || "-";
  const notes = fields.notes
    ? `<div class="sec">Notes</div><div class="row"><span class="v">${escapeHtml(notes)}</span></div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Digital Receipt - ${escapeHtml(code)}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #1e293b; margin: 0; padding: 24px; background: #f1f5f9; }
  .print-wrap { text-align: center; margin-bottom: 16px; }
  .print-btn { padding: 10px 22px; background: #1e3a8a; color: #fff; border: 0; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .print-btn:hover { background: #1e40af; }
  .receipt { max-width: 420px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
  .head { padding: 20px; text-align: center; border-bottom: 1px dashed #cbd5e1; background: #f8fafc; }
  .head h1 { margin: 0; font-size: 18px; letter-spacing: 1px; color: #0f172a; }
  .head .sub { margin-top: 4px; font-size: 11px; color: #94a3b8; }
  .code { margin-top: 10px; font-family: Consolas, monospace; font-size: 14px; font-weight: 700; color: #1e3a8a; }
  .body { padding: 20px; }
  .sec { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 14px 0 4px; border-top: 1px dashed #e2e8f0; padding-top: 12px; }
  .row { display: flex; justify-content: space-between; gap: 16px; padding: 6px 0; font-size: 14px; }
  .row .k { color: #64748b; }
  .row .v { font-weight: 600; text-align: right; }
  .hash { margin-top: 8px; font-family: Consolas, monospace; font-size: 10px; color: #475569; word-break: break-all; line-height: 1.5; }
  .foot { padding: 14px 20px; border-top: 1px solid #e2e8f0; background: #f8fafc; font-size: 11px; color: #94a3b8; text-align: center; }
  @media print {
    body { background: #fff; padding: 0; }
    .print-wrap { display: none; }
    .receipt { border: 0; border-radius: 0; max-width: 100%; }
  }
</style>
</head>
<body>
  <div class="print-wrap"><button class="print-btn" onclick="window.print()">Print / Save as PDF</button></div>
  <div class="receipt">
    <div class="head">
      <h1>DIGITAL RECEIPT</h1>
      <div class="sub">Immutably recorded on the SHA-256 ledger</div>
      <div class="code">${escapeHtml(code)}</div>
    </div>
    <div class="body">
      ${buildRows(fields)}
      ${notes}
      <div class="sec">Non-Repudiation Proof</div>
      <div class="hash">SHA-256: ${escapeHtml(hash)}</div>
    </div>
    <div class="foot">Ledger integrity verified via SHA-256 hash chain &amp; Ed25519 digital signatures.</div>
  </div>
</body>
</html>`;
}

export const openReceiptInNewTab = (receipt) => {
  const html = buildReceiptHtml(receipt);
  if (!html) return;
  const win = window.open("", "_blank");
  if (!win) {
    window.alert("Popup blocked. Please allow popups to view the receipt.");
    return;
  }
  win.document.write(html);
  win.document.close();
};
