import React, { useState, useMemo } from 'react';
import { createIncident } from '../services/incidentService';

function ReportIncidentModal({ isOpen, onClose, onSuccess, requests = [], requestsLoading = false }) {
  // Filter to only currently borrowed assets (handed_over status)
  const borrowedAssets = useMemo(
    () => requests.filter(req => req._status === 'handed_over'),
    [requests]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    asset_id: '',
    severity: 'medium',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ asset_id: '', severity: 'medium', description: '' });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createIncident({
        asset_id: Number(formData.asset_id),
        severity: formData.severity,
        description: formData.description,
      });
      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit incident report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        {/* MODAL HEADER */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Report Incident</h2>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* ERROR BANNER */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* SELECT ASSET */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Asset
            </label>
            <select
              name="asset_id"
              value={formData.asset_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                {requestsLoading ? 'Loading assets...' : borrowedAssets.length === 0 ? 'No borrowed assets' : 'Choose an asset...'}
              </option>
              {borrowedAssets.map(req => (
                <option key={req._assetId} value={req._assetId}>
                  {req.asset}
                </option>
              ))}
            </select>
          </div>

          {/* SEVERITY */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Severity
            </label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low - Minor cosmetic issue</option>
              <option value="medium">Medium - Functional issue</option>
              <option value="severe">Severe - Device broken / unusable</option>
              <option value="lost">Lost - Device is missing</option>
              <option value="critical">Critical - Data breach / theft</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the incident in detail (e.g. screen damage, power issue, lost device)..."
              rows="3"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* FORM ACTIONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportIncidentModal;