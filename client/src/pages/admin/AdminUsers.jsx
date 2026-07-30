import React, { useState, useCallback } from 'react';
import { FiEdit, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import AddUserModal from '../../components/AddUserModal';
import EditUserModal from '../../components/EditUserModal';
import ConfirmModal from '../../components/ConfirmModal';
import Toast, { createToast } from '../../components/Toast';
import { deleteUser, resetUserDeviceKey } from '../../services/userService';

const AdminUsers = ({ users = [], loading = false, onRefresh }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  // Delete confirm modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Reset key confirm modal
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);

  // Loading states for modals
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Toast
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type) => {
    setToasts(prev => [...prev, createToast(message, type)]);
  }, []);
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleDeleteUser = (user) => {
    setDeleteTarget(user);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget._id);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      if (onRefresh) onRefresh();
      addToast(`${deleteTarget.name} has been deleted.`, "success");
    } catch (err) {
      setIsDeleteOpen(false);
      addToast(err.message || `Failed to delete ${deleteTarget.name}. They may have active requests or transactions.`, "error");
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetKey = (user) => {
    setResetTarget(user);
    setIsResetOpen(true);
  };

  const confirmReset = async () => {
    if (!resetTarget) return;
    setIsResetting(true);
    try {
      await resetUserDeviceKey(resetTarget._id);
      setIsResetOpen(false);
      setResetTarget(null);
      if (onRefresh) onRefresh();
      addToast(`${resetTarget.name}'s device key has been reset.`, "success");
    } catch (err) {
      setIsResetOpen(false);
      addToast(err.message || `Failed to reset key for ${resetTarget.name}.`, "error");
      setResetTarget(null);
    } finally {
      setIsResetting(false);
    }
  };

  const filteredUsers = showInactive
    ? users
    : users.filter(u => u.status === 'Active' || u.status === 'On Leave');

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">User Management</h3>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <label className="inline-flex items-center gap-2 text-sm text-slate-650 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] w-4 h-4 cursor-pointer"
              />
              <span>Show Inactive/Resigned</span>
            </label>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors cursor-pointer"
            >
              + Add User
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              {showInactive
                ? 'No users found.'
                : 'No active users found. Toggle "Show Inactive/Resigned" to view archived profiles.'}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Department</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Device</th>
                  <th className="p-4 font-semibold text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm">
                      <div className="font-semibold text-slate-800">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{user.department}</td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center text-slate-600">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          user.status === 'Active' ? 'bg-emerald-500' :
                          user.status === 'On Leave' ? 'bg-amber-400' :
                          user.status === 'Suspended' ? 'bg-red-500' : 'bg-slate-300'
                        }`}></span>
                        {user.status}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          user.public_key ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}></span>
                        <span className={user.public_key ? 'text-emerald-700' : 'text-slate-400'}>
                          {user.public_key ? 'Registered' : 'Not Registered'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-right pr-6">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-semibold border border-transparent hover:border-blue-100"
                          title="Edit Profile"
                        >
                          <FiEdit size={14} />
                          <span>Edit</span>
                        </button>
                          <button
                            onClick={() => handleResetKey(user)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-semibold border border-transparent hover:border-amber-100"
                            title="Reset Device Key"
                          >
                            <FiRefreshCw size={14} className="text-amber-500" />
                            <span className="text-amber-600">Reset Key</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-semibold border border-transparent hover:border-red-100"
                            title="Delete User"
                          >
                            <FiTrash2 size={14} className="text-red-500" />
                            <span className="text-red-600">Delete</span>
                          </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={onRefresh}
        users={users}
      />

      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={onRefresh}
        user={editingUser}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.name || 'this user'}? This action cannot be undone and will remove all their data from the system.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={isResetOpen}
        onClose={() => { setIsResetOpen(false); setResetTarget(null); }}
        onConfirm={confirmReset}
        title="Reset Device Key"
        message={`Reset device key for ${resetTarget?.name || 'this user'}? They will need to re-register their device on next login.`}
        confirmLabel="Reset Key"
        variant="primary"
        isLoading={isResetting}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  );
};

export default AdminUsers;
