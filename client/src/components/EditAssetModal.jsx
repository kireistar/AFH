import React, { useState, useEffect } from 'react';
import { updateAsset } from '../services/assetService';

function EditAssetModal({ isOpen, onClose, onSuccess, asset }) {
  const [formData, setFormData] = useState({
    brand: '',
    asset_name: '',
    category: '',
    status: '',
    current_condition: '',
    location: '',
    serial_number: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Populate form data when the modal opens or selected asset changes
  useEffect(() => {
    if (asset) {
      setFormData({
        brand: asset.brand === '-' ? '' : asset.brand,
        asset_name: asset.name || '',
        category: asset._category || '',
        status: asset._status || '',
        current_condition: asset._condition || 'good',
        location: asset.location === '-' ? '' : asset.location,
        serial_number: asset.serialNumber === '-' ? '' : asset.serialNumber,
        notes: asset.notes || ''
      });
      setError('');
    }
  }, [asset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.brand.trim()) {
      setError('Brand is required.');
      return;
    }
    if (!formData.asset_name.trim()) {
      setError('Device Name is required.');
      return;
    }
    if (!formData.category) {
      setError('Category is required.');
      return;
    }
    if (!formData.status) {
      setError('Status is required.');
      return;
    }

    setSubmitting(true);
    try {
      await updateAsset(asset._id, {
        brand: formData.brand.trim(),
        asset_name: formData.asset_name.trim(),
        category: formData.category,
        status: formData.status,
        current_condition: formData.current_condition,
        location: formData.location.trim() || null,
        serial_number: formData.serial_number.trim() || null,
        notes: formData.notes.trim() || null
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to update asset. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !asset) return null;

  const categories = [
    { value: 'laptop', label: 'Laptop' },
    { value: 'desktop', label: 'Desktop' },
    { value: 'mobile', label: 'Mobile Phone / Tablet' },
    { value: 'peripheral', label: 'Peripheral (Mouse, Keyboard, Monitor)' },
    { value: 'projector', label: 'Projector' },
    { value: 'server', label: 'Server' },
    { value: 'network', label: 'Network Equipment (Router, Switch)' },
    { value: 'other', label: 'Other' },
  ];

  const statuses = [
    { value: 'available', label: 'Available' },
    { value: 'borrowed', label: 'Borrowed' },
    { value: 'maintenance', label: 'Maintenance (Temporarily Unavailable)' },
    { value: 'retired', label: 'Retired (Permanently Unavailable)' },
  ];

  const conditions = [
    { value: 'good', label: 'Good' },
    { value: 'minor_damage', label: 'Minor Damage' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'lost', label: 'Lost' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full mx-4 overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Asset</h2>
            <p className="text-xs text-slate-500 mt-1">
              Modify details for Asset ID: <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{asset.id}</span>
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Container */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 animate-pulse">
              <span className="text-base">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Grid Layout for Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Brand */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Apple, Lenovo, Logitech"
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Device Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Device Name (Type)</label>
              <input
                type="text"
                name="asset_name"
                value={formData.asset_name}
                onChange={handleChange}
                placeholder="e.g., MacBook Pro"
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              >
                {statuses.map((stat) => (
                  <option key={stat.value} value={stat.value}>
                    {stat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Condition */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Condition</label>
              <select
                name="current_condition"
                value={formData.current_condition}
                onChange={handleChange}
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              >
                {conditions.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Serial Number */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Serial Number (Optional)</label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                placeholder="SN-XXXX-XXXX"
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Location (Optional)</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., IT Storage Room 2B"
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Notes / Remarks (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Write any comments regarding the device state..."
                rows="3"
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 resize-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-750 font-semibold rounded-xl text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors duration-250 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 active:bg-blue-950 text-white font-semibold rounded-xl text-sm transition-colors duration-250 shadow-md shadow-blue-900/10 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default EditAssetModal;
