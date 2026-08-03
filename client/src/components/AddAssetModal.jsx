import React, { useState } from 'react';
import { createAsset, uploadAssetImage } from '../services/assetService';
import { FiUpload, FiX } from 'react-icons/fi';

import { API_BASE_URL } from '../services/apiClient';

function AddAssetModal({ isOpen, onClose, onSuccess, assets = [] }) {
  const [formData, setFormData] = useState({
    brand: '',
    customBrand: '',
    asset_name: '',
    category: '',
    customCategory: '',
    status: 'available',
    current_condition: 'good',
    serial_number: '',
    location: '',
    purchase_value: '',
    image_url: '',
    warranty_expiry_date: '',
    vendor_name: '',
    notes: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
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

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WEBP, etc.).');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    setUploadingImage(true);
    setError('');

    try {
      const res = await uploadAssetImage(file);
      setFormData(prev => ({ ...prev, image_url: res.image_url }));
    } catch (err) {
      setError('Failed to upload local image file: ' + err.message);
      setImagePreview('');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleClearImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
    setImagePreview('');
  };

  const finalCategory = formData.category === '__new__' ? formData.customCategory : formData.category;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.brand.trim()) {
      setError('Brand is required.');
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
        brand: formData.brand.trim(),
        asset_name: formData.asset_name.trim(),
        category: finalCategory,
        status: formData.status,
        current_condition: formData.current_condition,
        serial_number: formData.serial_number.trim() || null,
        location: formData.location.trim() || null,
        purchase_value: formData.purchase_value ? parseFloat(formData.purchase_value) : 0,
        image_url: formData.image_url.trim() || null,
        notes: formData.notes.trim() || null
      });

      setFormData({
        brand: '',
        asset_name: '',
        category: '',
        customCategory: '',
        status: 'available',
        current_condition: 'good',
        serial_number: '',
        location: '',
        purchase_value: '',
        image_url: '',
        notes: ''
      });
      setImagePreview('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to add asset. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'retired', label: 'Retired' },
  ];

  const conditions = [
    { value: 'good', label: 'Good' },
    { value: 'minor_damage', label: 'Minor Damage' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'lost', label: 'Lost' },
  ];

  const currentDisplayImage = imagePreview || (formData.image_url ? (formData.image_url.startsWith('/uploads/') ? `${API_BASE_URL}${formData.image_url}` : formData.image_url) : '');

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full mx-4 overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Add New Asset</h2>
            <p className="text-xs text-slate-500 mt-1">Register a new IT hardware or device with full specs.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 animate-pulse">
              <span className="text-base">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Device Image Upload Box */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Device Photo <span className="text-xs text-slate-400 font-normal">(Local File Upload)</span>
            </label>

            {currentDisplayImage ? (
              <div className="relative w-full h-32 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center group">
                <img src={currentDisplayImage} alt="Device Preview" className="w-full h-full object-contain p-1" />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-semibold gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading local file...</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-lg transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <FiX size={14} />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-[#1E3A8A] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/30 transition-all text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-2">
                  <FiUpload size={18} />
                </div>
                <span className="text-xs font-bold text-slate-700">Click to select local image file</span>
                <span className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WEBP supported</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploadingImage || submitting}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Brand & Device Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Apple, Lenovo, Microsoft"
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Device Name (Model)</label>
              <input
                type="text"
                name="asset_name"
                value={formData.asset_name}
                onChange={handleChange}
                placeholder={'e.g., Surface Laptop 5'}
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>
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
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-850 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50 cursor-pointer"
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

          {/* Serial Number & Purchase Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Serial Number</label>
              <input
                type="text"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                placeholder="e.g., W1N0CV11972704C"
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Purchase Cost (IDR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="purchase_value"
                value={formData.purchase_value}
                onChange={handleChange}
                placeholder="e.g., 15000000"
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Vendor Name & Warranty Expiry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Vendor / Supplier</label>
              <input
                type="text"
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleChange}
                placeholder="e.g., PT Apple Indonesia"
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Warranty Expiration Date</label>
              <input
                type="date"
                name="warranty_expiry_date"
                value={formData.warranty_expiry_date}
                onChange={handleChange}
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Location & Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Office Room 302, Samarinda"
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Hardware Condition</label>
              <select
                name="current_condition"
                value={formData.current_condition}
                onChange={handleChange}
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-850 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50 cursor-pointer"
              >
                {conditions.map((cd) => (
                  <option key={cd.value} value={cd.value}>
                    {cd.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Notes / Remarks</label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional specification notes or maintenance details..."
              disabled={submitting}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || uploadingImage}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-750 font-semibold rounded-xl text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors duration-250 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage}
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
