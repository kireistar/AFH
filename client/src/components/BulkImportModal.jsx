import React, { useState } from 'react';
import { FiUpload, FiX, FiDownload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { apiUpload } from '../services/apiClient';

function BulkImportModal({ isOpen, onClose, type = 'assets', onSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isAsset = type === 'assets';
  const title = isAsset ? 'Bulk Import Assets' : 'Bulk Import Users';
  const endpoint = isAsset ? '/api/v1/assets/bulk-import-csv' : '/api/v1/users/bulk-import-csv';

  const handleDownloadTemplate = () => {
    let headers = '';
    let sample = '';
    if (isAsset) {
      headers = 'asset_name,category,brand,serial_number,purchase_value,location,vendor_name,notes';
      sample = 'MacBook Pro M3 16",laptop,Apple,SN-MBP-9081,35000000,Head Office - Lt 4,PT Apple Indonesia,High performance development laptop';
    } else {
      headers = 'employee_id,employee_name,email,role,department';
      sample = 'EMP-9001,John Doe,john.doe@afh.com,user,IT Engineering';
    }

    const csvContent = `${headers}\n${sample}\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sample_${type}_import.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.endsWith('.csv')) {
        setError('Please select a valid .csv file');
        setFile(null);
        return;
      }
      setError('');
      setFile(selected);
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiUpload(endpoint, formData);
      setResult(res);
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to import CSV file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 mt-1">Upload a .CSV file to bulk import records.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
            <FiX size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <FiAlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Template Download Banner */}
          <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between">
            <div className="text-xs text-blue-900 font-medium">
              Need the correct formatting?
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FiDownload size={13} />
              <span>Download Template</span>
            </button>
          </div>

          {/* Dropzone */}
          <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer block space-y-2">
              <FiUpload size={28} className="mx-auto text-slate-400" />
              <div className="text-sm font-semibold text-slate-700">
                {file ? file.name : 'Click to select CSV file'}
              </div>
              <p className="text-xs text-slate-400">Supported format: .csv</p>
            </label>
          </div>

          {/* Import Results Banner */}
          {result && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                <FiCheckCircle size={16} />
                <span>Successfully imported {result.imported_count} record(s)!</span>
              </div>
              {result.errors && result.errors.length > 0 && (
                <div className="text-[11px] text-red-600 bg-white p-2.5 rounded-lg border border-red-100 max-h-32 overflow-y-auto font-mono">
                  {result.errors.map((err, idx) => (
                    <div key={idx}>{err}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
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
              disabled={!file || uploading}
              className="flex-1 px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-semibold rounded-xl text-sm transition-colors shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {uploading ? (
                <span>Importing...</span>
              ) : (
                <>
                  <FiUpload size={15} />
                  <span>Start Import</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default BulkImportModal;
