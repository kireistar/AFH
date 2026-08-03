import React, { useState, useEffect } from 'react';
import { FiX, FiLock, FiShield, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { apiPost } from '../services/apiClient';
import { getOrGenerateKeyPair } from '../utils/crypto';

function AccountSecurityModal({ isOpen, onClose, user }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deviceKey, setDeviceKey] = useState(null);

  useEffect(() => {
    if (isOpen) {
      getOrGenerateKeyPair()
        .then(res => setDeviceKey(res.pubKeyBase64))
        .catch(() => setDeviceKey(null));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      await apiPost('/api/v1/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-[#1E3A8A] rounded-xl">
              <FiShield size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Account & Device Security</h3>
              <p className="text-xs text-slate-500">Manage security preferences and physical keys.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Ed25519 Device Shield Status */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FiCheckCircle size={14} className="text-emerald-600" />
                Ed25519 Physical Key Status
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Registered Public Key (Base64):
            </div>
            <div className="font-mono text-[10px] bg-white p-2 rounded-lg border border-slate-200 text-slate-700 truncate select-all">
              {deviceKey || user?.public_key || 'Loading device key...'}
            </div>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FiLock size={14} />
              Change Password
            </h4>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <FiAlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                <FiCheckCircle size={15} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1E3A8A]"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1E3A8A]"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#1E3A8A]"
                placeholder="Re-enter new password"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-semibold rounded-xl text-sm transition-colors shadow-md disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default AccountSecurityModal;
