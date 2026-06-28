import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import AddUserModal from '../../components/AddUserModal';
import EditUserModal from '../../components/EditUserModal';
import ConfirmModal from '../../components/ConfirmModal';
import { useToast } from '../../components/Toast';
import TableSkeleton from '../../components/TableSkeleton';
import Pagination from '../../components/Pagination';
import { deleteUser } from '../../services/userService';

const AdminUsers = ({ users = [], loading = false, onRefresh }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToast();
  
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showInactive]);

  const handleDeleteUser = (user) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteUser(user._id);
          toast.success("User deleted successfully!");
          if (onRefresh) onRefresh();
        } catch (err) {
          toast.error(err.message || `Failed to delete ${user.name}. It is likely they have active requests or transactions connected to their account.`);
        }
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Filter users based on showInactive toggle and searchQuery
  const filteredUsers = (showInactive
    ? users
    : users.filter(u => u.status === 'Active' || u.status === 'On Leave')
  ).filter(u => 
    !searchQuery.trim() || 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculation
  const itemsPerPage = 10;
  const totalItems = filteredUsers.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">User Management</h3>
            <p className="text-xs text-slate-500 mt-1">Manage and filter organization member details.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            {/* Search input */}
            <div className="flex flex-col gap-1 min-w-[150px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, dept..."
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-4 pt-4 md:pt-0">
              <label className="inline-flex items-center gap-2 text-sm text-slate-655 font-semibold cursor-pointer">
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
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton columns={4} rows={10} />
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              {showInactive 
                ? 'No users found.' 
                : 'No active users found. Toggle "Show Inactive/Resigned" to view archived profiles.'}
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 font-semibold">User</th>
                    <th className="p-4 font-semibold">Department</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentUsers.map(user => (
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
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-semibold border border-transparent hover:border-red-100"
                            title="Delete User"
                          >
                            <FiTrash2 size={14} className="text-red-500" />
                            <span className="text-red-650">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText="Delete"
        isDanger={true}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

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
    </>
  );
};

export default AdminUsers;