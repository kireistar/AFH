import React, { useState } from 'react';
import { FiX, FiClock, FiAlertCircle } from 'react-icons/fi';
import { createRequest } from '../services/requestService';

function RequestExtensionModal({ isOpen, onClose, onSuccess, asset }) {
  const [extensionDate, setExtensionDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!extensionDate) {
      setError('Please select a valid extension date.');
      return;
    }

    setSubmitting(true);

    try {
      await createRequest({
        asset_id: asset._id || asset.id,
        endDate: extensionDate,
        reason: `[EXTENSION REQUEST] ${reason || 'Requesting loan period extension.'}`,
      });
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit extension request.');
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
              <FiClock size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Extend Asset Loan</h3>
              <p className="text-xs text-slate-500">{asset.name} ({asset.id})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <FiX size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <FiAlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">New Requested End Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={extensionDate}
              onChange={(e) => setExtensionDate(e.target.value)}
              disabled={submitting}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Reason for Extension</label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need to extend the loan period for this device..."
              disabled={submitting}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-semibold rounded-xl text-sm transition-colors shadow-md disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2"
            >
              {submitting ? 'Submitting...' : 'Submit Extension'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default RequestExtensionModal;
