'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import UserModal from './settings.user.usermodal';
import AddUserModal from './settings.user.addmodal';
import DeleteConfirmModal from './DeleteConfirmModal';

const UserManagementSettings = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now());
  const [preventUserRegistration, setPreventUserRegistration] = useState(false);

  useEffect(() => {
    const loadGeneralSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setPreventUserRegistration(data.preventUserRegistration || false);
        }
      } catch (error) {
        console.error('Error loading general settings:', error);
      }
    };
    loadGeneralSettings();
  }, []);

  const handlePreventUserRegistrationChange = async (e) => {
    const newValue = e.target.checked;
    setPreventUserRegistration(newValue);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preventUserRegistration: newValue
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage('Failed to update registration settings');
      setPreventUserRegistration(!newValue); // Revert on error
    }
  };

  useEffect(() => {
    const handleAvatarUpdate = () => {
      setTimestamp(Date.now());
    };

    window.addEventListener('user-avatar-updated', handleAvatarUpdate);
    return () => window.removeEventListener('user-avatar-updated', handleAvatarUpdate);
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/users?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset page when search term or limit changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, limit]);

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleEditClick = (user) => {
    setEditingUser({
      ...user,
      password: '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e, updatedUserData) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });

      if (response.ok) {
        setMessage('User updated successfully');
        loadUsers();
        setIsEditModalOpen(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setMessage('Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    const userToDelete = users.find(user => user.id === userId);
    setUserToDelete(userToDelete);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userToDelete.id }),
      });

      if (response.ok) {
        setMessage('User deleted successfully');
        loadUsers();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage('Failed to delete user');
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleAddSubmit = async (e, newUserData) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserData),
      });

      if (response.ok) {
        setMessage('User created successfully');
        loadUsers();
        setIsAddModalOpen(false);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setMessage('Failed to create user');
    }
  };

  const getAvatarSrc = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('data:')) return avatar;
    
    // Convert filename to dynamic API path
    const filename = avatar.includes('/') 
      ? avatar.split('/').pop() 
      : avatar;
    
    return `/api/uploads/user-avatars/${filename}?t=${timestamp}`;
  };

  const Pagination = () => (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-2">
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="border rounded px-2 py-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="ri-arrow-left-line"></i>
          Previous
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <i className="ri-arrow-right-line"></i>
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
        >
          <i className="ri-user-add-line"></i>
          Add User
        </button>
      </div>

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="preventUserRegistration"
          checked={preventUserRegistration}
          onChange={handlePreventUserRegistrationChange}
          className="mr-2"
        />
        <label htmlFor="preventUserRegistration" className="text-sm text-gray-700 dark:text-gray-300">
          Prevent user registration. With this checked, users cannot register on their own.
        </label>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.includes('success')
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="mb-4 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
        />
        {loading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto my-4 border border-gray-300 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <input 
                  type="checkbox"
                  checked={selectedUsers.length === users.length}
                  onChange={() => setSelectedUsers(
                    selectedUsers.length === users.length 
                      ? [] 
                      : users.map(user => user.id)
                  )}
                  className="rounded border-gray-300"
                  title="Select All Users"
                />
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                NAME
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                EMAIL
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ROLE
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                STATUS
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserSelect(user.id)}
                    className="rounded border-gray-300"
                    title={`Select ${user.name}`}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    {user.avatar ? (
                      <div className="h-8 w-8 rounded-full overflow-hidden relative mr-2">
                        <Image 
                          src={getAvatarSrc(user.avatar)}
                          alt={user.name}
                          className="object-cover"
                          fill
                          sizes="32px"
                          priority
                          unoptimized={true}
                          key={timestamp}
                        />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 mr-2 flex items-center justify-center">
                        <i className="ri-user-line text-gray-500 dark:text-gray-400"></i>
                      </div>
                    )}
                    {user.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span className={`px-2 py-1 rounded-full ${
                    user.role === 'Admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : user.role === 'PowerUser'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span className={`px-2 py-1 rounded-full ${
                    user.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="text-gray-500 text-xl hover:text-blue-500 mr-2"
                    title={`Edit ${user.name}`}
                    aria-label={`Edit ${user.name}`}
                  >
                    <i className="ri-edit-line"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-gray-500 text-xl hover:text-red-500"
                    title={`Delete ${user.name}`}
                    aria-label={`Delete ${user.name}`}
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination />

      <UserModal
        user={editingUser}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
      />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        itemTitle={userToDelete?.name || ''}
      />
    </div>
  );
};

export default UserManagementSettings;
