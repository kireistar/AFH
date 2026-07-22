import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { getOrGenerateKeyPair, signPayload, deterministicStringify } from '../../utils/crypto';
import { apiPost } from '../../services/apiClient';

export default function AdminQRModal({ requestObj, onClose, onSuccess }) {
  const [qrPayload, setQrPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateAndSignToken();
  }, []);

  const generateAndSignToken = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Ambil Private & Public Key Admin
      const { privKey, pubKeyBase64 } = await getOrGenerateKeyPair();

      // 2. Buat parameter token & waktu
      const adminTokenString = crypto.randomUUID().replace(/-/g, '');
      const expiresAt = Math.floor(Date.now() / 1000) + 300; // 5 menit dari sekarang

      // 3. Susun payload persis seperti HandoverQRPayload di backend
      // CATATAN: Pastikan requestObj memiliki asset.asset_code dan user.employee_id
      const payloadToSign = {
        token: adminTokenString,
        request_id: requestObj.id,
        asset_code: requestObj.asset?.asset_code || requestObj.asset_code,
        borrower_employee_id: requestObj.user?.employee_id || requestObj.borrower_employee_id,
        expires_at: expiresAt
      };

      // 4. Stringify secara deterministik agar sesuai dengan backend Python
      const serializedPayload = deterministicStringify(payloadToSign);

      // 5. Sign payload menggunakan kunci privat Ed25519
      const signatureBase64 = await signPayload(serializedPayload, privKey);

      // 6. Tembak endpoint /generate
      await apiPost('/api/v1/handover-tokens/generate', {
        request_id: requestObj.id,
        admin_token_string: adminTokenString,
        admin_signature: signatureBase64,
        expires_at: expiresAt
      }, {
        headers: {
          'x-ed25519-public-key': pubKeyBase64 // Inline TOFU dari backend
        }
      });

      // 7. Jika sukses, siapkan string yang akan ditampilkan ke dalam bentuk QR Code
      // Kita hanya memasukkan token string ke dalam QR agar scannernya cepat dan ringan.
      setQrPayload(adminTokenString);

    } catch (err) {
      console.error('Failed to generate QR Token:', err);
      setError(err.message || 'An error occurred during cryptographic processing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Secure Handover</h2>
        <p className="text-sm text-slate-500 mb-6">
          Ask the borrower to scan this QR code using their device.
        </p>

        <div className="flex justify-center items-center bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[250px]">
          {loading ? (
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          ) : error ? (
            <div className="text-red-500 text-sm font-medium">{error}</div>
          ) : (
            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200">
              <QRCodeCanvas
                value={qrPayload}
                size={200}
                level={"H"}
                includeMargin={true}
              />
            </div>
          )}
        </div>

        {qrPayload && (
          <p className="text-xs font-mono text-slate-400 mt-4 break-all">
            {qrPayload}
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
