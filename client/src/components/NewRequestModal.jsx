import React, { useState } from 'react';
import useAssets from '../hooks/useAssets';
import { createRequest } from '../services/requestService';

function NewRequestModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    asset_id: '',
    startDate: '',
    endDate: '',
    reason: '',
    is_long_term: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load daftar asset yang tersedia dari backend
  const { assets, loading: loadingAssets } = useAssets(true); // true = only available

  const today = new Date().toISOString().split('T')[0];

  // >= 12 months = auto long-term, cannot be unchecked
  const autoLongTerm =
    formData.startDate &&
    formData.endDate &&
    (new Date(formData.endDate) - new Date(formData.startDate)) >= 365 * 24 * 60 * 60 * 1000;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.startDate < today) {
      setError('Start date cannot be before today.');
      return;
    }

    if (formData.endDate < formData.startDate) {
      setError('End date must be on or after the start date.');
      return;
    }

    setSubmitting(true);
    try {
      await createRequest({
        asset_id: parseInt(formData.asset_id),  // backend butuh integer
        requested_start: formData.startDate,
        requested_end: formData.endDate,
        reason: formData.reason,
        is_long_term: autoLongTerm || formData.is_long_term,
      });
      setFormData({ asset_id: '', startDate: '', endDate: '', reason: '', is_long_term: false });
      onClose();
      if (onSuccess) onSuccess(); // trigger refresh di parent
    } catch (err) {
      setError(err.message || 'Gagal submit request. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">New Asset Request</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Asset</label>
            <select
              name="asset_id"
              value={formData.asset_id}
              onChange={handleChange}
              required
              disabled={loadingAssets}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">{loadingAssets ? 'Loading...' : 'Choose an asset...'}</option>
              {assets.map(asset => (
                <option key={asset._id} value={asset._id}>
                  {asset.name} ({asset.id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              min={today}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              min={formData.startDate || today}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Reason / Notes</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Explain why you need this asset..."
              rows="3"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <label className={`flex items-start gap-3 p-3 border rounded-lg ${autoLongTerm ? 'bg-blue-100/60 border-blue-300' : 'bg-blue-50/60 border-blue-200'}`}>
            <input
              type="checkbox"
              name="is_long_term"
              checked={autoLongTerm || formData.is_long_term}
              disabled={autoLongTerm}
              onChange={handleChange}
              className="mt-1 w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed cursor-pointer"
            />
            <span className="text-sm text-gray-700">
              <span className="font-semibold">Long-term loan</span> — I will keep this asset until I leave the company.
              (Your loan will be reviewed weekly to confirm the asset is still with you.)
              {autoLongTerm && (
                <span className="block mt-1 text-xs text-blue-700 font-medium">
                  Automatically enabled for loans of 12 months or more.
                </span>
              )}
            </span>
          </label>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewRequestModal;