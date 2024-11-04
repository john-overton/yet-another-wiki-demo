'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import SecretQuestionsFormContent from './SecretQuestionsFormContent';

const UserSettingsModal = ({ user, isOpen, onClose }) => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSecretQuestions, setShowSecretQuestions] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    setAvatarPreview(user?.avatar || null);
  }, [user]);

  if (!isOpen) return null;

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

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
      setMessage({ type: 'success', content: 'Avatar updated successfully' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setAvatarPreview(user?.avatar || null);
      setMessage({ type: 'error', content: 'Failed to upload avatar' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          name: formData.get('name'),
          email: formData.get('email'),
          password: formData.get('password') || undefined,
          avatar: avatarPreview,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user settings');
      }

      setMessage({ type: 'success', content: 'Settings updated successfully' });
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', content: 'Failed to update settings' });
    }
  };

  const getAvatarSrc = () => {
    if (!avatarPreview) return null;
    if (avatarPreview.startsWith('data:')) return avatarPreview;
    if (avatarPreview.startsWith('http')) return avatarPreview;
    return `${process.env.NEXT_PUBLIC_BASE_URL || ''}${avatarPreview}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">User Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {message.content && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-400'
              : 'bg-red-100 text-red-700 border border-red-400'
          }`}>
            {message.content}
          </div>
        )}

        {showSecretQuestions ? (
          <SecretQuestionsFormContent
            onComplete={() => {
              setShowSecretQuestions(false);
              setMessage({ type: 'success', content: 'Security questions updated successfully' });
            }}
          />
        ) : (
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
                  className={`absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg cursor-pointer ${
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
                New Password
              </label>
              <input
                type="password"
                name="password"
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                placeholder="Leave blank to keep current password"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowSecretQuestions(true)}
              className="w-full px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2 mb-4"
            >
              <i className="ri-shield-keyhole-line"></i>
              Update Security Questions
            </button>

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
        )}
      </div>
    </div>
  );
};

export default UserSettingsModal;
