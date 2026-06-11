import React, { useState, useEffect } from 'react';
import { updateUser } from '../services/userService';

function EditUserModal({ isOpen, onClose, onSuccess, user }) {
  const [formData, setFormData] = useState({
    employee_name: '',
    email: '',
    department: '',
    customDepartment: '',
    role: 'user',
    clearance_level: 1,
    employment_status: 'Active',
    resignation_date: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // List of pre-defined departments for options
  const predefinedDepartments = [
    'IT Department',
    'Product & Engineering',
    'Sales & Marketing',
    'Human Resources (HR)',
    'Finance & Accounting',
    'Operations',
    'Legal & Compliance',
    'Customer Support'
  ];

  // Populate data when modal opens or selected user changes
  useEffect(() => {
    if (user) {
      const isCustomDep = user.department && !predefinedDepartments.includes(user.department);
      
      setFormData({
        employee_name: user.name || '',
        email: user.email || '',
        department: isCustomDep ? 'custom' : (user.department || ''),
        customDepartment: isCustomDep ? user.department : '',
        role: user.role || 'user',
        clearance_level: user.clearanceLevel || 1,
        employment_status: user.status || 'Active',
        resignation_date: user.resignationDate || ''
      });
      setError('');
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.employee_name.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required.');
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
      const payload = {
        employee_name: formData.employee_name.trim(),
        email: formData.email.trim(),
        department: selectedDepartment,
        role: formData.role,
        clearance_level: parseInt(formData.clearance_level, 10),
        employment_status: formData.employment_status,
        resignation_date: formData.employment_status === 'Resigned' ? (formData.resignation_date || new Date().toISOString().split('T')[0]) : null
      };

      await updateUser(user._id, payload);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to update user profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

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

  const statusOptions = [
    { value: 'Active', label: 'Active (Working / Active)' },
    { value: 'On Leave', label: 'On Leave (Temporary Inactive)' },
    { value: 'Suspended', label: 'Suspended (Revoked Login)' },
    { value: 'Resigned', label: 'Resigned (Archived Profile)' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full mx-4 overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Employee Profile</h2>
            <p className="text-xs text-slate-500 mt-1">
              Modify details for Employee ID: <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{user.id}</span>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 animate-pulse">
              <span className="text-base">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
            </div>

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
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
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
              {departmentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Department Name */}
          {formData.department === 'custom' && (
            <div className="space-y-1.5 animate-in fade-in duration-250">
              <label className="block text-sm font-semibold text-slate-700">Custom Department Name</label>
              <input
                type="text"
                name="customDepartment"
                value={formData.customDepartment}
                onChange={handleChange}
                placeholder="Enter custom department"
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
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
                  <option key={opt.value} value={opt.value}>
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
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-855 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              >
                {clearanceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid for Employment Status and Resignation Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Employment Status</label>
              <select
                name="employment_status"
                value={formData.employment_status}
                onChange={handleChange}
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-855 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.employment_status === 'Resigned' && (
              <div className="space-y-1.5 animate-in fade-in duration-250">
                <label className="block text-sm font-semibold text-slate-700">Resignation Date</label>
                <input
                  type="date"
                  name="resignation_date"
                  value={formData.resignation_date}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-200 disabled:opacity-50"
                />
              </div>
            )}
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
                'Save Changes'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default EditUserModal;
