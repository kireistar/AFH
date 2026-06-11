import React, { useState, useEffect } from 'react';
import { createUser } from '../services/userService';

function AddUserModal({ isOpen, onClose, onSuccess, users = [] }) {
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_name: '',
    email: '',
    password: '',
    department: '',
    customDepartment: '',
    role: 'user',
    clearance_level: 1,
    hire_date: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Auto-generate employee ID by checking existing ones
      const empIds = users
        .map(u => u.id)
        .filter(id => typeof id === 'string' && /^EMP-\d+$/.test(id))
        .map(id => parseInt(id.split('-')[1], 10));
      
      const nextNum = empIds.length > 0 ? Math.max(...empIds) + 1 : 1;
      const generatedId = `EMP-${String(nextNum).padStart(4, '0')}`;
      
      // Default hire date to today
      const today = new Date().toISOString().split('T')[0];

      setFormData({
        employee_id: generatedId,
        employee_name: '',
        email: '',
        password: '',
        department: '',
        customDepartment: '',
        role: 'user',
        clearance_level: 1,
        hire_date: today
      });
      setError('');
    }
  }, [isOpen, users]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field Validations
    if (!formData.employee_id.trim()) {
      setError('Employee ID is required.');
      return;
    }
    if (!formData.employee_name.trim()) {
      setError('Employee Name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    let selectedDepartment = formData.department;
    if (selectedDepartment === 'custom') {
      if (!formData.customDepartment.trim()) {
        setError('Please specify the custom department name.');
        return;
      }
      selectedDepartment = formData.customDepartment.trim();
    } else if (!selectedDepartment) {
      setError('Please select a department.');
      return;
    }

    setSubmitting(true);
    try {
      await createUser({
        employee_id: formData.employee_id.trim(),
        employee_name: formData.employee_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        department: selectedDepartment,
        role: formData.role,
        clearance_level: parseInt(formData.clearance_level, 10),
        hire_date: formData.hire_date,
        employment_status: 'Active'
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to add user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const departmentOptions = [
    { value: 'IT Department', label: 'IT Department' },
    { value: 'Product & Engineering', label: 'Product & Engineering' },
    { value: 'Sales & Marketing', label: 'Sales & Marketing' },
    { value: 'Human Resources (HR)', label: 'Human Resources (HR)' },
    { value: 'Finance & Accounting', label: 'Finance & Accounting' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Legal & Compliance', label: 'Legal & Compliance' },
    { value: 'Customer Support', label: 'Customer Support' },
    { value: 'custom', label: 'Other (Type custom department...)' },
  ];

  const roleOptions = [
    { value: 'user', label: 'User (Staff / Employee)' },
    { value: 'manager', label: 'Manager (Operations Manager)' },
    { value: 'finance', label: 'Finance (Finance Officer)' },
    { value: 'admin', label: 'Admin (System Administrator)' },
  ];

  const clearanceOptions = [
    { value: 1, label: 'Level 1 - Staff / Basic User' },
    { value: 2, label: 'Level 2 - Team Lead' },
    { value: 3, label: 'Level 3 - Admin / Finance Officer' },
    { value: 4, label: 'Level 4 - Operations Manager' },
    { value: 5, label: 'Level 5 - Director / Executive' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full mx-4 overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Add New User</h2>
            <p className="text-xs text-slate-500 mt-1">Register a new employee profile and security credentials.</p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 animate-pulse">
              <span className="text-base">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Grid for Employee ID and Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Employee ID</label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                placeholder="e.g., EMP-0001"
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                name="employee_name"
                value={formData.employee_name}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Grid for Email and Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., john.doe@afh.com"
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              disabled={submitting}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-850 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
            >
              <option value="" disabled className="text-slate-400">Select department...</option>
              {departmentOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-slate-800">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Department Input if 'custom' is selected */}
          {formData.department === 'custom' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="block text-sm font-semibold text-slate-700">Custom Department Name</label>
              <input
                type="text"
                name="customDepartment"
                value={formData.customDepartment}
                onChange={handleChange}
                placeholder="Enter custom department name"
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>
          )}

          {/* Grid for Role and Clearance Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Security Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-850 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              >
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="text-slate-800">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Clearance Level</label>
              <select
                name="clearance_level"
                value={formData.clearance_level}
                onChange={handleChange}
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-850 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              >
                {clearanceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="text-slate-800">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hire Date */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Hire Date</label>
            <input
              type="date"
              name="hire_date"
              value={formData.hire_date}
              onChange={handleChange}
              required
              disabled={submitting}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 shrink-0">
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
                'Add User'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default AddUserModal;
