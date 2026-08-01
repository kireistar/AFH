import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiUser, FiMail, FiBriefcase, FiShield, FiKey, FiCheck, FiX, FiMonitor } from 'react-icons/fi';
import { fetchUserById, updateUser, resetUserDeviceKey } from '../../services/userService';
import { fetchAssets } from '../../services/assetService';
import ConfirmModal from '../../components/ConfirmModal';
import Toast, { createToast } from '../../components/Toast';

function ViewUser() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [user, setUser] = useState(null);
  const [userAssets, setUserAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inline Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Reset Key modal & Toast state
  const [isResetKeyOpen, setIsResetKeyOpen] = useState(false);
  const [isResettingKey, setIsResettingKey] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type) => {
    setToasts(prev => [...prev, createToast(message, type)]);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: 'user',
    status: 'Active'
  });

  const loadUserData = async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const uData = await fetchUserById(userId);
      setUser(uData);
      populateFormData(uData);

      if (searchParams.get('edit') === 'true') {
        setIsEditing(true);
      }

      // Fetch borrowed assets for this user
      try {
        const allAssets = await fetchAssets();
        const borrowed = allAssets.filter(a => 
          a.borrowedBy && (
            String(a.borrowedBy._id) === String(uData._id) || 
            String(a.borrowedBy.id) === String(uData.id)
          )
        );
        setUserAssets(borrowed);
      } catch {
        setUserAssets([]);
      }

    } catch (err) {
      setError(err.message || `Failed to load user profile for ID #${userId}.`);
    } finally {
      setLoading(false);
    }
  };

  const populateFormData = (uData) => {
    if (!uData) return;
    setFormData({
      name: uData.name || '',
      email: uData.email || '',
      department: uData.department || '',
      role: uData.role || 'user',
      status: uData.status || 'Active'
    });
    setSaveError('');
  };

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStartEditing = () => {
    if (user) populateFormData(user);
    setIsEditing(true);
    setSearchParams({ edit: 'true' });
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setSaveError('');
    if (user) populateFormData(user);
    if (searchParams.has('edit')) {
      searchParams.delete('edit');
      setSearchParams(searchParams);
    }
  };

  const handleSaveUser = async (e) => {
    if (e) e.preventDefault();
    setSaveError('');

    if (!formData.name.trim()) {
      setSaveError('Employee Full Name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setSaveError('Email Address is required.');
      return;
    }

    setSaving(true);
    try {
      await updateUser(user._id, {
        employee_name: formData.name.trim(),
        email: formData.email.trim(),
        department: formData.department.trim(),
        role: formData.role,
        employment_status: formData.status
      });

      setIsEditing(false);
      if (searchParams.has('edit')) {
        searchParams.delete('edit');
        setSearchParams(searchParams);
      }
      addToast('User profile updated successfully!', 'success');
      await loadUserData();
    } catch (err) {
      setSaveError(err.message || 'Failed to update user profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmResetKey = async () => {
    setIsResettingKey(true);
    try {
      await resetUserDeviceKey(user._id);
      setIsResetKeyOpen(false);
      addToast('Device security key reset successfully. User must re-register hardware key.', 'success');
      await loadUserData();
    } catch (err) {
      addToast('Failed to reset device key: ' + err.message, 'error');
    } finally {
      setIsResettingKey(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-600">Loading user profile...</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">
          ⚠️ {error || 'User profile not found.'}
        </div>
        <button
          onClick={() => navigate('/admin/users')}
          className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-semibold hover:bg-blue-900 transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <FiArrowLeft size={14} />
          <span>Back to Users</span>
        </button>
      </div>
    );
  }

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    manager: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    finance: 'bg-amber-100 text-amber-800 border-amber-200',
    user: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
            title="Back to User Management"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800">User Profile: {user.name}</h1>
              {isEditing && (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full animate-pulse">
                  Editing Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Employee Account #{user.id} — Role: {user.role?.toUpperCase()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEditing}
                disabled={saving}
                className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <FiX size={14} />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSaveUser}
                disabled={saving}
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
                onClick={() => setIsResetKeyOpen(true)}
                className="px-3.5 py-2 border border-amber-300 text-amber-800 hover:bg-amber-50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Reset Hardware Key"
              >
                <FiKey size={14} />
                <span>Reset Device Key</span>
              </button>
              <button
                onClick={handleStartEditing}
                className="px-3.5 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <FiEdit size={14} />
                <span>Edit User</span>
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
        
        {/* Left Column: Specs / Profile Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              {isEditing ? 'Edit Employee Account Information' : 'Employee Account Details'}
            </h3>
            <span className="text-xs text-slate-400 font-mono">ID: #{user._id}</span>
          </div>

          <table className="w-full text-left border-collapse">
            <tbody>
              {/* Employee ID */}
              <tr className="border-b border-slate-100 bg-white">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Employee ID</td>
                <td className="py-3.5 px-6 text-xs text-slate-800"><span className="font-mono font-bold text-slate-800">{user.id}</span></td>
              </tr>

              {/* Full Name */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Full Name</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Julian Edward"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                    />
                  ) : (
                    <span className="font-bold text-slate-900">{user.name}</span>
                  )}
                </td>
              </tr>

              {/* Email Address */}
              <tr className="border-b border-slate-100 bg-white">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Email Address</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="julian.edward@company.com"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                    />
                  ) : (
                    <span className="text-slate-800">{user.email}</span>
                  )}
                </td>
              </tr>

              {/* Department */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Department</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g., R&D - Overseas Planning"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                    />
                  ) : (
                    user.department || '-'
                  )}
                </td>
              </tr>

              {/* System Role */}
              <tr className="border-b border-slate-100 bg-white">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">System Role</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">
                  {isEditing ? (
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="user">User (Standard Employee)</option>
                      <option value="admin">Admin (System Administrator)</option>
                      <option value="manager">Manager (Approver)</option>
                      <option value="finance">Finance (Auditor)</option>
                    </select>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${roleColors[user.role] || roleColors.user}`}>
                      {user.role?.toUpperCase()}
                    </span>
                  )}
                </td>
              </tr>

              {/* Employment Status */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Employment Status</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">
                  {isEditing ? (
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      user.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      <span>{user.status || 'Active'}</span>
                    </span>
                  )}
                </td>
              </tr>

              {/* Risk Score & Tier */}
              <tr className="border-b border-slate-100 bg-white">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Risk Score & Tier</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md font-mono text-xs font-bold">
                    {user.riskScore || 0} ({user.riskTier || 'Low Risk'})
                  </span>
                </td>
              </tr>

              {/* Hardware Device Shield Key */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="py-3.5 px-6 text-xs font-semibold text-slate-500 w-1/3 border-r border-slate-100">Device Shield Key</td>
                <td className="py-3.5 px-6 text-xs text-slate-800">
                  {user.public_key ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Ed25519 Registered</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-700 font-bold text-xs bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>Key Pending Registration</span>
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Column: Currently Borrowed Devices Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Borrowed Devices Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <FiMonitor size={16} className="text-[#1E3A8A]" />
                <span>Currently Borrowed Hardware ({userAssets.length})</span>
              </h3>
            </div>

            {userAssets.length > 0 ? (
              <div className="space-y-3">
                {userAssets.map(asset => (
                  <div key={asset._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="overflow-hidden">
                      <Link 
                        to={`/admin/assets/view/${asset._id}`} 
                        className="font-bold text-slate-900 text-xs hover:text-[#1E3A8A] hover:underline truncate block"
                      >
                        {asset.brand !== '-' ? `${asset.brand} ` : ''}{asset.name}
                      </Link>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">SN: {asset.serialNumber || 'N/A'}</p>
                    </div>
                    <Link
                      to={`/admin/assets/view/${asset._id}`}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shrink-0 transition-colors"
                    >
                      View Asset →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                No active device loans assigned to this employee.
              </div>
            )}
          </div>

          {/* Reset Device Key Action Card */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-2">
            <h3 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
              <FiShield size={16} />
              <span>Hardware Shield Key Management</span>
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              If the employee changes their laptop or loses their hardware key, reset their key to force device re-registration.
            </p>
            <button
              onClick={() => setIsResetKeyOpen(true)}
              className="mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <FiKey size={13} />
              <span>Reset Ed25519 Device Key</span>
            </button>
          </div>

        </div>

      </div>

      {/* Confirm Reset Key Modal */}
      <ConfirmModal
        isOpen={isResetKeyOpen}
        onClose={() => setIsResetKeyOpen(false)}
        onConfirm={handleConfirmResetKey}
        title="Reset Hardware Device Key"
        message={`Are you sure you want to reset the registered Ed25519 device key for ${user.name}? They will be required to re-register their physical hardware key upon next login.`}
        confirmLabel="Reset Key"
        variant="danger"
        isLoading={isResettingKey}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default ViewUser;
