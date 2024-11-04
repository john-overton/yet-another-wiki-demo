'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const UserModal = ({ user, isOpen, onClose, onSubmit }) => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resetSecurityQuestions, setResetSecurityQuestions] = useState(false);

  useEffect(() => {
    // Reset avatar preview when user changes
    setAvatarPreview(user?.avatar || null);
    setResetSecurityQuestions(false); // Reset the checkbox when user changes
  }, [user]);

  if (!isOpen) return null;

  const roles = ['User', 'PowerUser', 'Admin'];

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      setAvatarPreview(data.avatar);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      // Revert preview on error
      setAvatarPreview(user?.avatar || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedUser = {
      ...user,
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
      is_active: formData.get('is_active') === 'on',
      avatar: avatarPreview,
    };

    // Only include security question reset if checkbox is checked
    if (resetSecurityQuestions) {
      updatedUser.resetSecurityQuestions = true;
    }

    await onSubmit(e, updatedUser);
  };

  const getAvatarSrc = () => {
    if (!avatarPreview) {
      return null;
    }
    if (avatarPreview.startsWith('data:')) {
      return avatarPreview;
    }
    if (avatarPreview.startsWith('http')) {
      return avatarPreview;
    }
    return `${process.env.NEXT_PUBLIC_BASE_URL || ''}${avatarPreview}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit User</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              {avatarPreview ? (
                <div className="h-24 w-24 rounded-full overflow-hidden relative">
                  <Image 
                    src={getAvatarSrc()}
                    alt={user?.name || 'User avatar'}
                    width={96}
                    height={96}
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <i className="ri-user-line text-3xl text-gray-500 dark:text-gray-400"></i>
                </div>
              )}
              <label 
                htmlFor="avatar" 
                className={`absolute bottom-0 right-0 bg-white dark:bg-gray-400 rounded-full p-2 shadow-lg cursor-pointer ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {isUploading ? (
                  <i className="ri-loader-4-line animate-spin text-gray-600 dark:text-gray-300"></i>
                ) : (
                  <i className="ri-camera-line p-1 text-gray-600 dark:text-gray-300"></i>
                )}
              </label>
              <input
                type="file"
                id="avatar"
                name="avatar"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isUploading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={user?.name || ''}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              defaultValue={user?.email || ''}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              name="role"
              defaultValue={user?.role || 'User'}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={user?.is_active}
              className="rounded border-gray-300 mr-2"
              id="is_active"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="reset_security"
              checked={resetSecurityQuestions}
              onChange={(e) => setResetSecurityQuestions(e.target.checked)}
              className="rounded border-gray-300 mr-2"
            />
            <label htmlFor="reset_security" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Reset Security Questions
            </label>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
            >
              <i className="ri-save-line"></i>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
