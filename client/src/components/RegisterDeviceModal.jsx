import React, { useState } from 'react';
import { getOrGenerateKeyPair, signPayload } from '../utils/crypto';
import { apiPost } from '../services/apiClient';

export default function RegisterDeviceModal({ user, onKeyRegistered, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State untuk mengontrol transisi layar sukses
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegisterDevice = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Generate atau ambil Ed25519 keypair dari IndexedDB
      const { privKey, pubKeyBase64 } = await getOrGenerateKeyPair();

      // 2. Proof-of-possession: sign challenge string
      const challenge = `register:${user.id}`;
      const signature = await signPayload(challenge, privKey);

      // 3. Kirim public key + signature ke backend API
      await apiPost('/api/v1/users/register-key', {
        public_key: pubKeyBase64,
        signature,
      });

      // 3. Force Sync LocalStorage
      // Memaksa update data user di storage agar kebal terhadap page refresh (F5)
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr);
          storedUser.public_key = pubKeyBase64; // Injeksi key agar tidak null saat refresh
          localStorage.setItem('user', JSON.stringify(storedUser));
        } catch (e) {
          console.error("Failed to sync local storage:", e);
        }
      }

      // 4. Tampilkan pesan berhasil
      setIsSuccess(true);

      // 5. Beri jeda 2 detik sebelum UI disembunyikan
      setTimeout(async () => {
        if (typeof onKeyRegistered === 'function') {
          await onKeyRegistered();
        }

        if (typeof onClose === 'function') {
          onClose();
        } else if (typeof onKeyRegistered !== 'function') {
          window.location.reload();
        }
      }, 2000);

    } catch (err) {
      console.error('Device registration failed:', err);
      const errMsg = err?.message || '';

      // Jika kunci sudah terdaftar di server, treat as success
      if (errMsg.toLowerCase().includes('already registered') || errMsg.includes('sudah terdaftar')) {
        setIsSuccess(true);
        setTimeout(async () => {
          if (typeof onKeyRegistered === 'function') await onKeyRegistered();
          if (typeof onClose === 'function') onClose();
        }, 2000);
        return;
      }

      setError(errMsg || 'Failed to register device. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center border border-gray-100 transform transition-all">

        {/* SUCCESS SCREEN */}
        {isSuccess ? (
          <div className="py-6 animate-fade-in">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-inner">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Registration Successful
            </h2>
            <p className="text-gray-500 text-sm">
              Your cryptographic device key has been secured. Initializing dashboard...
            </p>
          </div>
        ) : (
          /* REGISTRATION FORM (DEFAULT SCREEN) */
          <>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🛡️
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Device Registration Required
            </h2>

            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Hello <span className="font-semibold text-gray-800">{user?.employee_name || 'User'}</span>.
              Your account requires a registered cryptographic device key to sign and verify asset handover transactions.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <button
              onClick={handleRegisterDevice}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl shadow-md transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Securing Key...' : 'Register This Device'}
            </button>

            {typeof onClose === 'function' && (
              <button
                onClick={onClose}
                disabled={loading}
                className="w-full mt-3 py-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition cursor-pointer disabled:opacity-50"
              >
                Cancel Process
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
