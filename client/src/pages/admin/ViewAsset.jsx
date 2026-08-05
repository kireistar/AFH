import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiUser, FiMapPin, FiMaximize2, FiCheck, FiX, FiUpload } from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';
import { QRCodeSVG } from 'qrcode.react';
import { fetchAssetById, updateAsset, uploadAssetImage } from '../../services/assetService';
import UserProfileModal from '../../components/UserProfileModal';
import AssetQRModal from '../../components/AssetQRModal';
import ImageLightboxModal from '../../components/ImageLightboxModal';
import { statusBadge } from '../../utils/styles';

import { API_BASE_URL } from '../../services/apiClient';

function ViewAsset() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inline Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    brand: '',
    asset_name: '',
    category: '',
    current_condition: 'good',
    serial_number: '',
    location: '',
    purchase_value: '',
    image_url: '',
    notes: ''
  });

  // Modals state
  const [isQROpen, setIsQROpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const loadAssetData = async () => {
    if (!assetId) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchAssetById(assetId);
      setAsset(data);
      populateFormData(data);
      if (searchParams.get('edit') === 'true') {
        setIsEditing(true);
      }
    } catch (err) {
      setError(err.message || `Failed to load asset details for ID #${assetId}.`);
    } finally {
      setLoading(false);
    }
  };

  const populateFormData = (data) => {
    if (!data) return;
    setFormData({
      brand: data.brand === '-' ? '' : data.brand,
      asset_name: data.name || '',
      category: data._category || '',
      current_condition: data._condition || 'good',
      serial_number: data.serialNumber === '-' ? '' : data.serialNumber,
      location: data.location === '-' ? '' : data.location,
      purchase_value: data.purchaseValue !== undefined && data.purchaseValue !== null ? String(data.purchaseValue) : '',
      image_url: data._imageUrlRaw || data.imageUrl || '',
      notes: data.notes || ''
    });
    setImagePreview('');
    setSaveError('');
  };

  useEffect(() => {
    loadAssetData();
  }, [assetId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveError('Please select a valid image file (JPEG, PNG, WEBP, etc.).');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    setUploadingImage(true);
    setSaveError('');

    try {
      const res = await uploadAssetImage(file);
      setFormData(prev => ({ ...prev, image_url: res.image_url }));
    } catch (err) {
      setSaveError('Failed to upload local image file: ' + err.message);
      setImagePreview('');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleClearImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
    setImagePreview('');
  };

  const handleStartEditing = () => {
    if (asset) populateFormData(asset);
    setIsEditing(true);
    setSearchParams({ edit: 'true' });
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setSaveError('');
    if (asset) populateFormData(asset);
    if (searchParams.has('edit')) {
      searchParams.delete('edit');
      setSearchParams(searchParams);
    }
  };

  const handleSaveAsset = async (e) => {
    if (e) e.preventDefault();
    setSaveError('');

    if (!formData.brand.trim()) {
      setSaveError('Brand is required.');
      return;
    }
    if (!formData.asset_name.trim()) {
      setSaveError('Device Name is required.');
      return;
    }
    if (!formData.category) {
      setSaveError('Category is required.');
      return;
    }

    setSaving(true);
    try {
      await updateAsset(asset._id, {
        brand: formData.brand.trim(),
        asset_name: formData.asset_name.trim(),
        category: formData.category,
        current_condition: formData.current_condition,
        location: formData.location.trim() || null,
        serial_number: formData.serial_number.trim() || null,
        purchase_value: formData.purchase_value ? parseFloat(formData.purchase_value) : 0,
        image_url: formData.image_url.trim() || null,
        notes: formData.notes.trim() || null
      });

      setIsEditing(false);
      if (searchParams.has('edit')) {
        searchParams.delete('edit');
        setSearchParams(searchParams);
      }
      await loadAssetData();
    } catch (err) {
      setSaveError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-600">Loading asset details...</span>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">
          ⚠️ {error || 'Asset not found.'}
        </div>
        <button
          onClick={() => navigate('/admin/assets')}
          className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-semibold hover:bg-blue-900 transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <FiArrowLeft size={14} />
          <span>Back to Inventory</span>
        </button>
      </div>
    );
  }

  const qrPageUrl = `${window.location.origin}/assets/view/${asset._id}`;
  const displayImage = imagePreview || (formData.image_url ? (formData.image_url.startsWith('/uploads/') ? `${API_BASE_URL}${formData.image_url}` : formData.image_url) : asset.imageUrl);

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

  const conditions = [
    { value: 'good', label: 'Good' },
    { value: 'minor_damage', label: 'Minor Damage' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'lost', label: 'Lost' },
  ];

  const renderStatusBadge = (status) => {
    let dotColor = 'bg-slate-400';

    if (status === 'Available') {
      dotColor = 'bg-emerald-500';
    } else if (status === 'Borrowed') {
      dotColor = 'bg-[#1E3A8A]';
    } else if (status === 'Maintenance' || status === 'Maintenanced') {
      dotColor = 'bg-amber-500';
    } else if (status === 'Retired' || status === 'Broken' || status === 'Damaged' || status === 'Lost') {
      dotColor = 'bg-rose-500';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge(status)}`}>
        <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/assets')}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
            title="Back to Inventory"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800">View Asset: {asset.id}</h1>
              {isEditing && (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full animate-pulse">
                  Editing Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Comprehensive IT hardware specifications and lifecycle history.</p>

            {/* Warranty Status Banner */}
            {asset.warranty_expiry_date && (
              <div className="mt-2 text-xs font-semibold flex items-center gap-2">
                {new Date(asset.warranty_expiry_date) < new Date() ? (
                  <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full border border-red-200">
                    🔴 Warranty Expired ({new Date(asset.warranty_expiry_date).toLocaleDateString()})
                  </span>
                ) : (new Date(asset.warranty_expiry_date) - new Date()) / (1000 * 3600 * 24) <= 30 ? (
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                    ⚠️ Warranty Expiring Soon ({new Date(asset.warranty_expiry_date).toLocaleDateString()})
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                    🟢 Active Warranty (Expires: {new Date(asset.warranty_expiry_date).toLocaleDateString()})
                  </span>
                )}
                {asset.vendor_name && (
                  <span className="text-slate-500 text-xs">
                    Supplier: <strong className="text-slate-700">{asset.vendor_name}</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEditing}
                disabled={saving || uploadingImage}
                className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <FiX size={14} />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSaveAsset}
                disabled={saving || uploadingImage}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiCheck size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsQROpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <BsQrCode size={14} />
                <span>Print QR Label</span>
              </button>
              <button
                onClick={handleStartEditing}
                className="px-3.5 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <FiEdit size={14} />
                <span>Edit Asset</span>
              </button>
            </>
          )}
        </div>
      </div>

      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <span>⚠️ {saveError}</span>
          <button onClick={() => setSaveError('')} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Specs Table / Edit Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              {isEditing ? 'Edit Asset Specifications' : 'Asset Specifications'}
            </h3>
            <span className="text-xs text-slate-400 font-mono">ID: #{asset._id}</span>
          </div>

          <table className="w-full text-left border-collapse">
            <tbody>
              {/* Status */}
              <tr className="border-b border-slate-100 bg-white">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Status</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">{renderStatusBadge(asset.status)}</td>
              </tr>

              {/* Company */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Company</td>
                <td className="py-3.5 px-6 text-xs text-slate-800"><span className="font-bold text-slate-800">AFH4</span></td>
              </tr>

              {/* Asset Code */}
              <tr className="border-b border-slate-100 bg-white">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Asset ID</td>
                <td className="py-3.5 px-6 text-xs text-slate-800"><span className="font-mono font-semibold text-slate-800">{asset.id}</span></td>
              </tr>

              {/* Brand */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Brand</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">
                  {isEditing ? (
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="e.g., Apple, Microsoft"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                    />
                  ) : (
                    asset.brand || '-'
                  )}
                </td>
              </tr>

              {/* Asset Name */}
              <tr className="border-b border-slate-100 bg-white">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Asset Name (Model)</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">
                  {isEditing ? (
                    <input
                      type="text"
                      name="asset_name"
                      value={formData.asset_name}
                      onChange={handleChange}
                      placeholder="e.g., Surface Laptop 5"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                    />
                  ) : (
                    <span className="font-bold text-slate-900">{asset.name}</span>
                  )}
                </td>
              </tr>

              {/* Serial Number */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Serial Number</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">
                  {isEditing ? (
                    <input
                      type="text"
                      name="serial_number"
                      value={formData.serial_number}
                      onChange={handleChange}
                      placeholder="e.g., W1N0CV11972704C"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                    />
                  ) : (
                    <span className="font-mono text-slate-800">{asset.serialNumber || '-'}</span>
                  )}
                </td>
              </tr>

              {/* Category */}
              <tr className="border-b border-slate-100 bg-white">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Category</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">
                  {isEditing ? (
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none bg-white cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">{asset.category}</span>
                  )}
                </td>
              </tr>

              {/* Location */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Location</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Office Room 302"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                    />
                  ) : (
                    <div className="flex items-center gap-1 text-slate-700">
                      <FiMapPin size={13} className="text-slate-400" />
                      <span>{asset.location || '-'}</span>
                    </div>
                  )}
                </td>
              </tr>

              {/* Purchase Cost */}
              <tr className="border-b border-slate-100 bg-white">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Purchase Cost (IDR)</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      name="purchase_value"
                      value={formData.purchase_value}
                      onChange={handleChange}
                      placeholder="e.g., 15000000"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                    />
                  ) : (
                    <span className="font-semibold text-slate-800">{asset.purchaseValueFormatted}</span>
                  )}
                </td>
              </tr>

              {/* Hardware Condition */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Condition</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">
                  {isEditing ? (
                    <select
                      name="current_condition"
                      value={formData.current_condition}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none bg-white cursor-pointer"
                    >
                      {conditions.map((cd) => (
                        <option key={cd.value} value={cd.value}>{cd.label}</option>
                      ))}
                    </select>
                  ) : (
                    asset.condition || '-'
                  )}
                </td>
              </tr>

              {/* Notes */}
              <tr className="border-b border-slate-100 bg-white">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Notes</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">
                  {isEditing ? (
                    <textarea
                      name="notes"
                      rows={2}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Specification notes..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none resize-none"
                    />
                  ) : (
                    asset.notes || '-'
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Column: Photo, Borrower, Mini QR (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Photo Display / Upload Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Device Photo</h3>
              {displayImage && !isEditing && (
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="text-xs text-[#1E3A8A] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FiMaximize2 size={12} />
                  <span>Enlarge</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                {displayImage ? (
                  <div className="relative w-full h-48 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-2 group">
                    <img src={displayImage} alt={asset.name} className="max-h-full max-w-full object-contain rounded-lg" />
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-semibold gap-2 rounded-xl">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading...</span>
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
                    <span className="text-xs font-bold text-slate-700">Click to upload image file</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">JPEG, PNG, WEBP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploadingImage || saving}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            ) : (
              displayImage ? (
                <div 
                  onClick={() => setIsLightboxOpen(true)}
                  className="w-full h-64 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center p-2 cursor-pointer overflow-hidden group relative"
                >
                  <img 
                    src={displayImage} 
                    alt={asset.name} 
                    className="max-h-full max-w-full object-contain rounded-lg group-hover:scale-[1.02] transition-transform duration-200" 
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                    <FiMaximize2 size={16} />
                    <span>Click for Full Resolution</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <span>No hardware image attached</span>
                </div>
              )
            )}
          </div>

          {/* Checked Out To Card (if borrowed) */}
          {asset.status === 'Borrowed' && asset.borrowedBy && (
            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-2.5">
                <h3 className="font-bold text-[#1E3A8A] text-sm flex items-center gap-1.5">
                  <FiUser size={15} />
                  <span>Checked Out To</span>
                </h3>
                <button
                  onClick={() => setIsUserOpen(true)}
                  className="text-xs font-bold text-[#1E3A8A] hover:underline cursor-pointer"
                >
                  View Profile →
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-900 text-sm">{asset.borrowedBy.name}</p>
                <p className="text-slate-600"><span className="font-semibold">Department:</span> {asset.borrowedBy.department || '-'}</p>
                <p className="text-slate-600"><span className="font-semibold">Role:</span> {asset.borrowedBy.role || '-'}</p>
                <p className="text-slate-600"><span className="font-semibold">Email:</span> {asset.borrowedBy.email || '-'}</p>
              </div>
            </div>
          )}

          {/* Mini QR Code Sticker Preview Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-slate-800 text-sm">Asset Sticker Label</h3>
              <button
                onClick={() => setIsQROpen(true)}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Print Label →
              </button>
            </div>

            <div className="border border-slate-300 rounded-xl p-3 bg-white flex items-center gap-4">
              <div className="shrink-0 p-1 bg-white border border-slate-100 rounded-lg">
                <QRCodeSVG value={qrPageUrl} size={80} level="H" />
              </div>
              <div className="font-mono text-xs text-black space-y-1 overflow-hidden">
                <p className="font-bold text-slate-900 truncate">AFH4</p>
                <p className="text-[11px] text-slate-700 truncate"><span className="text-[9px] text-slate-400 uppercase block">Serial</span>{asset.serialNumber || 'N/A'}</p>
                <p className="text-[11px] text-slate-700 truncate"><span className="text-[9px] text-slate-400 uppercase block">Model</span>{`${asset.brand !== '-' ? asset.brand : ''} ${asset.name}`.trim()}</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Modals */}
      <UserProfileModal
        isOpen={isUserOpen}
        onClose={() => setIsUserOpen(false)}
        user={asset.borrowedBy}
        assetInfo={asset}
      />

      <AssetQRModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        asset={asset}
      />

      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        src={displayImage}
        title={`${asset.brand !== '-' ? asset.brand : ''} ${asset.name}`}
      />
    </div>
  );
}

export default ViewAsset;
