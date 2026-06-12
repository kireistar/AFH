import React, { useState } from 'react';
import { createAsset } from '../services/assetService';

function AddAssetModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    brand: '',
    asset_name: '',
    category: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validasi basic
    if (!formData.brand.trim()) {
      setError('Brand is required.');
      return;
    }
    if (!formData.asset_name.trim()) {
      setError('Device Name is required.');
      return;
    }
    if (!formData.category) {
      setError('Please select a category.');
      return;
    }

    setSubmitting(true);
    try {
      await createAsset({
        asset_name: formData.asset_name.trim(),
        brand: formData.brand.trim(),
        category: formData.category,
        // Optional default fields for backend validation:
        serial_number: null,
        purchase_value: 0,
        location: '',
        current_condition: 'good',
        status: 'available',
        notes: ''
      });
      
      // Reset form
      setFormData({ asset_name: '', brand: '', category: '' });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to add asset. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // List of valid categories for the select input
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

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full mx-4 overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Add New Asset</h2>
            <p className="text-xs text-slate-500 mt-1">Register a new IT hardware or device to the system.</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 animate-pulse">
              <span className="text-base">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}



          {/* Brand */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g., Apple, Lenovo, Logitech"
              required
              disabled={submitting}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
            />
          </div>

          {/* Device Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Device Name (Type)</label>
            <input
              type="text"
              name="asset_name"
              value={formData.asset_name}
              onChange={handleChange}
              placeholder={'e.g., MacBook Pro 16"'}
              required
              disabled={submitting}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
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
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-850 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
            >
              <option value="" disabled className="text-slate-400">Select asset category...</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value} className="text-slate-800">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
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
                'Add Asset'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default AddAssetModal;
