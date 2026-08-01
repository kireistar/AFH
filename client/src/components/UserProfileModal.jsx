import React from 'react';
<<<<<<< Updated upstream
import { FiMail, FiShield, FiKey, FiExternalLink, FiX } from 'react-icons/fi';

function UserProfileModal({ isOpen, onClose, user, onNavigateToUsers }) {
  if (!isOpen || !user) return null;

  const employeeName = user.employee_name || user.name || 'Unknown User';
  const email = user.email || (user.employee_id ? `${user.employee_id.toLowerCase()}@afh.com` : '-');
  const username = email !== '-' ? email.split('@')[0] : employeeName.toLowerCase().replace(/\s+/g, '.');
  const role = user.role || 'user';
  const department = user.department || '-';
  const employeeId = user.employee_id || user.id || '-';
  const status = user.employment_status || user.status || 'Active';
  const riskTier = user.risk_score_tier || user.riskTier || 'Low';
  const riskScore = user.risk_score !== undefined ? user.risk_score : 0;
  const hasKey = Boolean(user.public_key);

  const getRiskBadgeColor = (tier) => {
    if (tier === 'High') return 'bg-red-50 text-red-700 border-red-200';
    if (tier === 'Medium') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
=======
import { FiUser, FiMail, FiBriefcase, FiShield, FiCheckCircle, FiAlertTriangle, FiEdit, FiHardDrive } from 'react-icons/fi';

const UserProfileModal = ({ isOpen, onClose, user, assetInfo, onEditUser }) => {
  if (!isOpen || !user) return null;

  const initialLetter = (user.name || user.employee_name || 'U')[0].toUpperCase();

  const getRiskBadge = (tier) => {
    switch ((tier || '').toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'On Leave':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Suspended':
      case 'Resigned':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
>>>>>>> Stashed changes
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
<<<<<<< Updated upstream
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full mx-4 overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white font-bold text-lg flex items-center justify-center shadow-md shadow-blue-900/20">
              {(employeeName[0] || 'U').toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{employeeName}</h2>
              <p className="text-xs font-mono text-blue-600 font-semibold">@{username}</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-sm text-slate-700">
          <div className="grid grid-cols-2 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Employee ID</span>
              <span className="font-mono font-semibold text-slate-800 text-xs">{employeeId}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Role</span>
              <span className="font-semibold text-slate-800 capitalize text-xs">{role}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
              <span className="font-semibold text-slate-800 text-xs">{department}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
              <span className="font-semibold text-slate-800 text-xs">{status}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100">
              <div className="flex items-center gap-2">
                <FiMail className="text-slate-400" size={15} />
                <span className="text-xs text-slate-500 font-medium">Email</span>
              </div>
              <span className="text-xs font-semibold text-slate-800 font-mono">{email}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100">
              <div className="flex items-center gap-2">
                <FiShield className="text-slate-400" size={15} />
                <span className="text-xs text-slate-500 font-medium">AI Risk Profile</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getRiskBadgeColor(riskTier)}`}>
                {riskTier} Risk ({Number(riskScore).toFixed(0)} pt)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100">
              <div className="flex items-center gap-2">
                <FiKey className="text-slate-400" size={15} />
                <span className="text-xs text-slate-500 font-medium">Ed25519 Device Shield</span>
              </div>
              <span className={`text-xs font-semibold ${hasKey ? 'text-emerald-600' : 'text-slate-400'}`}>
                {hasKey ? '✓ Registered' : 'Not Registered'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
          {onNavigateToUsers && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToUsers();
              }}
              className="flex-1 py-2 px-4 bg-[#1E3A8A] hover:bg-blue-900 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Manage in Users</span>
              <FiExternalLink size={13} />
            </button>
          )}
=======
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full mx-4 overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header banner */}
        <div className="bg-gradient-to-r from-[#1E3A8A] to-blue-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl font-bold text-white shadow-inner">
              {initialLetter}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name || user.employee_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono bg-white/15 px-2 py-0.5 rounded text-blue-100 border border-white/10">
                  {user.id || user.employee_id}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(user.status)}`}>
                  {user.status || 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <FiBriefcase className="text-slate-400" size={13} />
                <span>Department</span>
              </div>
              <p className="font-semibold text-slate-800 truncate">{user.department || '-'}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
                <FiShield className="text-slate-400" size={13} />
                <span>Role</span>
              </div>
              <p className="font-semibold text-slate-800 capitalize">{user.role || 'user'}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <FiMail className="text-slate-400" size={13} />
              <span>Email Address</span>
            </div>
            <p className="font-medium text-slate-800 select-all">{user.email || '-'}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiAlertTriangle className="text-slate-400" size={14} />
              <span className="text-xs text-slate-600 font-medium">Risk Score Tier</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRiskBadge(user.riskTier)}`}>
              {user.riskTier || 'Low Risk'} {user.riskScore !== undefined ? `(${user.riskScore})` : ''}
            </span>
          </div>

          {assetInfo && (
            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl space-y-1">
              <div className="text-xs font-bold text-[#1E3A8A] flex items-center gap-1.5">
                <FiHardDrive size={14} />
                <span>Currently Borrowed Device</span>
              </div>
              <div className="text-xs font-medium text-slate-700">
                <span className="font-bold">{assetInfo.id}</span> — {assetInfo.name} ({assetInfo.brand})
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
          {onEditUser && (
            <button
              onClick={() => {
                onClose();
                onEditUser(user);
              }}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <FiEdit size={13} />
              <span>Edit User Profile</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-semibold hover:bg-blue-900 transition-colors cursor-pointer"
          >
            Close
          </button>
>>>>>>> Stashed changes
        </div>

      </div>
    </div>
  );
<<<<<<< Updated upstream
}
=======
};
>>>>>>> Stashed changes

export default UserProfileModal;
