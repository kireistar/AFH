import React, { useState } from 'react';
import { createAsset } from '../services/assetService';

function AddAssetModal({ isOpen, onClose, onSuccess, assets = [] }) {
  const [formData, setFormData] = useState({
    brand: '',
    customBrand: '',
    asset_name: '',
    category: '',
    customCategory: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default base categories
  const baseCategoryOptions = [
    { value: 'Laptop', label: 'Laptop' },
    { value: 'Desktop', label: 'Desktop' },
    { value: 'Mobile', label: 'Mobile Phone / Tablet' },
    { value: 'Peripheral', label: 'Peripheral (Mouse, Keyboard, Monitor)' },
    { value: 'Projector', label: 'Projector' },
    { value: 'Server', label: 'Server' },
    { value: 'Network', label: 'Network Equipment (Router, Switch)' },
    { value: 'Other', label: 'Other' },
  ];

  // Merge unique custom categories existing in assets
  const categoryValues = baseCategoryOptions.map(c => c.value);
  const extraCategories = Array.from(new Set(
    assets.map(a => a.category).filter(c => c && !categoryValues.includes(c))
  ));

  const allCategoryOptions = [
    ...baseCategoryOptions,
    ...extraCategories.map(c => ({ value: c, label: c }))
  ];

  // Merge unique brands existing in assets
  const defaultBrands = ['Apple', 'Lenovo', 'Dell', 'HP', 'Asus', 'Acer', 'Logitech', 'Epson'];
  const allBrands = Array.from(new Set([
    ...defaultBrands,
    ...assets.map(a => a.brand).filter(b => b && b !== '-')
  ])).sort();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalBrand = formData.brand === '__new__' ? formData.customBrand.trim() : formData.brand.trim();
    const finalCategory = formData.category === '__new__' ? formData.customCategory.trim() : formData.category.trim();

    // Basic validation
    if (!finalBrand) {
      setError('Brand is required. Select an existing brand or enter a new one.');
      return;
    }
    if (!formData.asset_name.trim()) {
      setError('Device Name is required.');
      return;
    }
    if (!finalCategory) {
      setError('Category is required. Select an existing category or enter a new one.');
      return;
    }

    setSubmitting(true);
    try {
      await createAsset({
        asset_name: formData.asset_name.trim(),
        brand: finalBrand,
        category: finalCategory,
        serial_number: null,
        purchase_value: 0,
        location: '',
        current_condition: 'good',
        status: 'available',
        notes: ''
      });
      
      // Reset form
      setFormData({ brand: '', customBrand: '', asset_name: '', category: '', customCategory: '' });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to add asset. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
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
            <select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              disabled={submitting}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              <option value="" disabled className="text-slate-400">Select brand...</option>
              {allBrands.map((b) => (
                <option key={b} value={b} className="text-slate-800">{b}</option>
              ))}
              <option value="__new__" className="font-bold text-[#1E3A8A] bg-blue-50">
                + Add New Brand...
              </option>
            </select>

            {formData.brand === '__new__' && (
              <div className="pt-1.5">
                <input
                  type="text"
                  name="customBrand"
                  value={formData.customBrand}
                  onChange={handleChange}
                  placeholder="Enter new brand name (e.g., Sony, Canon, Samsung)"
                  required
                  disabled={submitting}
                  className="w-full px-4 py-2.5 border border-blue-300 rounded-xl text-sm text-slate-800 bg-blue-50/40 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200"
                />
              </div>
            )}
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
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              <option value="" disabled className="text-slate-400">Select asset category...</option>
              {allCategoryOptions.map((cat) => (
                <option key={cat.value} value={cat.value} className="text-slate-800">
                  {cat.label}
                </option>
              ))}
              <option value="__new__" className="font-bold text-[#1E3A8A] bg-blue-50">
                + Add New Category...
              </option>
            </select>

            {formData.category === '__new__' && (
              <div className="pt-1.5">
                <input
                  type="text"
                  name="customCategory"
                  value={formData.customCategory}
                  onChange={handleChange}
                  placeholder="Enter new category name (e.g., Camera, Drone, Smartboard)"
                  required
                  disabled={submitting}
                  className="w-full px-4 py-2.5 border border-blue-300 rounded-xl text-sm text-slate-800 bg-blue-50/40 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-750 font-semibold rounded-xl text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors duration-250 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 active:bg-blue-950 text-white font-semibold rounded-xl text-sm transition-colors duration-250 shadow-md shadow-blue-900/10 disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
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
