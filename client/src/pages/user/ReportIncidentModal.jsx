import React, { useState } from 'react';

function ReportIncidentModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    asset: '',
    issueType: '',
    severity: '',
    description: '',
    attachments: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      attachments: e.target.files
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API call untuk submit incident report
    console.log('Incident report submitted:', formData);
    // Reset form
    setFormData({
      asset: '',
      issueType: '',
      severity: '',
      description: '',
      attachments: null
    });
    onClose();
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
          {/* SELECT ASSET */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Asset
            </label>
            <select
              name="asset"
              value={formData.asset}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose an asset...</option>
              <option value="macbook-m3">MacBook Pro M3</option>
              <option value="dell-monitor">Dell Monitor 27"</option>
              <option value="logitech-mouse">Logitech Mouse</option>
              <option value="usb-hub">USB-C Hub</option>
              <option value="keyboard">Logitech Keyboard</option>
              <option value="headset">Wireless Headset</option>
            </select>
          </div>

          {/* ISSUE TYPE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Issue Type
            </label>
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select issue type...</option>
              <option value="screen-damage">Screen Damage</option>
              <option value="power-issue">Power Issue</option>
              <option value="battery">Battery Not Charging</option>
              <option value="port">Port Malfunction</option>
              <option value="lost">Lost</option>
              <option value="software">Software Issue</option>
              <option value="other">Other</option>
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
              <option value="">Select severity...</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
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
              placeholder="Describe the incident in detail..."
              rows="3"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* ATTACHMENTS */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Attachments (Photos/Evidence)
            </label>
            <input
              type="file"
              name="attachments"
              onChange={handleFileChange}
              multiple
              accept="image/*"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Upload photos as evidence (optional)</p>
          </div>

          {/* FORM ACTIONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportIncidentModal;
