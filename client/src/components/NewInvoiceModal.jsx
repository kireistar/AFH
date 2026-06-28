import React, { useState, useEffect, useMemo } from 'react';
import { createInvoice } from '../services/invoiceService';
import { useToast } from './Toast';

function NewInvoiceModal({ isOpen, onClose, onSuccess, users = [], transactions = [] }) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    user_id: '',
    transaction_id: '',
    fine_amount: '',
    reason: '',
    due_date: '',
  });

  // Filter users to only active/valid ones
  const activeUsers = useMemo(() => {
    return users.filter(u => u.status === 'Active' || u.status === 'On Leave');
  }, [users]);

  // Filter transactions based on selected user UUID
  const userTransactions = useMemo(() => {
    if (!formData.user_id) return [];
    return transactions.filter(t => t._borrowerId === formData.user_id);
  }, [formData.user_id, transactions]);

  // Reset transaction selection when user changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, transaction_id: '' }));
  }, [formData.user_id]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        user_id: '',
        transaction_id: '',
        fine_amount: '',
        reason: '',
        due_date: '',
      });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.user_id) {
      setError('Please select a user.');
      return;
    }
    if (!formData.transaction_id) {
      setError('Please select an associated transaction.');
      return;
    }
    if (!formData.fine_amount || Number(formData.fine_amount) <= 0) {
      setError('Fine amount must be greater than 0.');
      return;
    }
    if (!formData.reason.trim()) {
      setError('Please provide a reason for the fine.');
      return;
    }
    if (!formData.due_date) {
      setError('Please specify a due date.');
      return;
    }

    setSubmitting(true);
    try {
      await createInvoice({
        user_id: formData.user_id,
        transaction_id: Number(formData.transaction_id),
        fine_amount: Number(formData.fine_amount),
        reason: formData.reason.trim(),
        due_date: formData.due_date,
      });

      toast.success('New invoice created successfully!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create invoice. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full mx-4 overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Create New Invoice</h2>
            <p className="text-xs text-slate-500 mt-1">Issue a new operating fine or late return penalty invoice.</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-650 rounded-xl text-sm font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <p className="leading-tight">{error}</p>
            </div>
          )}

          {/* User Select */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select User</label>
            <select
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all cursor-pointer"
            >
              <option value="">Choose a user...</option>
              {activeUsers.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} — {user.department}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Select */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Associated Transaction</label>
            <select
              name="transaction_id"
              value={formData.transaction_id}
              onChange={handleChange}
              required
              disabled={!formData.user_id}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {!formData.user_id 
                  ? 'Please select a user first' 
                  : userTransactions.length === 0 
                    ? 'No transaction logs found for this user' 
                    : 'Choose a transaction...'}
              </option>
              {userTransactions.map(t => (
                <option key={t._id} value={t._id}>
                  {t.id} — {t.action} ({t.asset})
                </option>
              ))}
            </select>
          </div>

          {/* Fine Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fine Amount (Rp)</label>
            <input
              type="number"
              name="fine_amount"
              value={formData.fine_amount}
              onChange={handleChange}
              placeholder="e.g. 50000"
              required
              min="0"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-805 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Describe the reason (e.g. Late return penalty of asset #AR-0012, Physical screen scratch damage)..."
              required
              rows="3"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-805 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all resize-none"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-805 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition-all cursor-pointer"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-[#1E3A8A] text-white hover:bg-blue-900 rounded-xl text-sm font-semibold transition-all cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewInvoiceModal;
