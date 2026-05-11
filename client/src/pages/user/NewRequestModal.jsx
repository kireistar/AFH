import React, { useState } from 'react';

function NewRequestModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    asset: '',
    duration: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API call untuk submit request
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      asset: '',
      duration: '',
      startDate: '',
      endDate: '',
      reason: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
        {/* MODAL HEADER */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">New Asset Request</h2>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* SELECT ASSET */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Asset
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

          {/* START DATE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* END DATE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* REASON / NOTES */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason / Notes
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Explain why you need this asset..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
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
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewRequestModal;
