'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import SecretQuestionsFormContent from './SecretQuestionsFormContent';
import AvatarCropModal from './AvatarCropModal';

const UserSettingsModal = ({ user, isOpen, onClose }) => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSecretQuestions, setShowSecretQuestions] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cropImage, setCropImage] = useState(null);
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffect(() => {
    if (user) {
      setAvatarPreview(user.avatar || null);
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (!isOpen) {
      // Reset states when modal closes
      setShowPasswordReset(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: '', content: '' });
      setCropImage(null);
      // Reset name and email to user values
      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Create a new HTMLImageElement
        const htmlImg = document.createElement('img');
        htmlImg.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const scaleSize = MAX_WIDTH / htmlImg.width;
          canvas.width = MAX_WIDTH;
          canvas.height = htmlImg.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(htmlImg, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], 'cropped.jpg', { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', 0.9);
        };
        htmlImg.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (blob) => {
    setIsUploading(true);
    setCropImage(null);
    
    try {
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }

      const data = await response.json();
      setAvatarPreview(data.avatar);
      
      // Update timestamp to force cache refresh
      const newTimestamp = Date.now();
      setTimestamp(newTimestamp);
      
      setMessage({ type: 'success', content: 'Avatar updated successfully' });
      
      // Force refresh user data with timestamp
      const event = new CustomEvent('user-avatar-updated', { 
        detail: { timestamp: newTimestamp }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setAvatarPreview(user?.avatar || null);
      setMessage({ type: 'error', content: 'Failed to upload avatar' });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', content: 'New passwords do not match' });
      return;
    }

    try {
      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          currentPassword,
          newPassword
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update password');
      }

      setMessage({ type: 'success', content: 'Password updated successfully' });
      setShowPasswordReset(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', content: error.message || 'Failed to update password' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          name,
          email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user settings');
      }

      setMessage({ type: 'success', content: 'Settings updated successfully' });
      
      // Dispatch event to update avatar in UserButton
      const event = new Event('user-avatar-updated');
      window.dispatchEvent(event);
      
      // Close the modal after successful update
      onClose();
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', content: 'Failed to update settings' });
    }
  };

  const getAvatarSrc = () => {
    if (!avatarPreview) return null;
    if (avatarPreview.startsWith('data:')) return avatarPreview;
    
    // Convert filename to dynamic API path
    const filename = avatarPreview.includes('/') 
      ? avatarPreview.split('/').pop() 
      : avatarPreview;
    
    return `/api/uploads/user-avatars/${filename}?t=${timestamp}`;
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

        {cropImage && (
          <AvatarCropModal
            image={cropImage}
            onComplete={handleCropComplete}
            onCancel={() => setCropImage(null)}
          />
        )}

        {showSecretQuestions ? (
          <SecretQuestionsFormContent
            onComplete={() => {
              setShowSecretQuestions(false);
              setMessage({ type: 'success', content: 'Security questions updated successfully' });
            }}
          />
        ) : showPasswordReset ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
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
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => setShowPasswordReset(false)}
                className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
              >
                <i className="ri-lock-password-line"></i>
                Update Password
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                {avatarPreview ? (
                  <div className="h-24 w-24 rounded-full overflow-hidden relative">
                    <Image 
                      src={getAvatarSrc()}
                      alt={user?.name || 'User avatar'}
                      className="object-cover"
                      fill
                      sizes="96px"
                      priority
                      unoptimized={true}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                required
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPasswordReset(true)}
              className="w-full px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2 mb-4"
            >
              <i className="ri-lock-password-line"></i>
              Change Password
            </button>

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
