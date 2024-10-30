'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const AddUserModal = ({ isOpen, onClose, onSubmit }) => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setEmailError('');
      setIsEmailValid(false);
      setAvatarPreview(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const roles = ['User', 'PowerUser', 'Admin'];

  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateEmail = (email) => {
    return emailRegex.test(email);
  };

  const checkEmailExists = async (email) => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      setIsEmailValid(false);
      return;
    }

    setIsCheckingEmail(true);
    try {
      const response = await fetch('/api/users/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setEmailError('This email is already registered');
          setIsEmailValid(false);
        } else {
          setEmailError('');
          setIsEmailValid(true);
        }
      } else {
        setEmailError('Failed to verify email');
        setIsEmailValid(false);
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailError('Failed to verify email');
      setIsEmailValid(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (!newEmail) {
      setEmailError('Email is required');
      setIsEmailValid(false);
      return;
    }

    if (!validateEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
      setIsEmailValid(false);
      return;
    }

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      checkEmailExists(newEmail);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

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
      setAvatarPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newUser = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
      is_active: formData.get('is_active') === 'on',
      avatar: avatarPreview,
      auth_type: 'local',
    };

    await onSubmit(e, newUser);
    // Form will be reset by the useEffect when modal is closed
  };

  const handleClose = () => {
    // Reset form state
    setEmail('');
    setEmailError('');
    setIsEmailValid(false);
    setAvatarPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add New User</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" id="addUserForm">
          <div className="flex justify-center mb-4">
            <div className="relative">
              {avatarPreview ? (
                <div className="h-24 w-24 rounded-full overflow-hidden relative">
                  <Image 
                    src={avatarPreview} 
                    alt="Avatar preview"
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
                  <i className="ri-loader-4-line animate-spin text-gray-600 dark:text-gray-300 p-1"></i>
                ) : (
                  <i className="ri-camera-line text-gray-600 dark:text-gray-300 p-1"></i>
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
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            {emailError && (
              <div className="text-sm text-red-500 dark:text-red-400 mb-1">
                {emailError}
              </div>
            )}
            <div className="relative">
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white ${
                  emailError ? 'border-red-500' : ''
                }`}
                required
              />
              {isCheckingEmail && (
                <div className="absolute right-3 top-2">
                  <i className="ri-loader-4-line animate-spin text-gray-600 dark:text-gray-300"></i>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
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
              defaultValue="User"
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={true}
              className="rounded border-gray-300 mr-2"
              id="is_active"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isEmailValid || isCheckingEmail}
              className={`px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black rounded-lg flex items-center gap-2 ${
                !isEmailValid || isCheckingEmail
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <i className="ri-user-add-line"></i>
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
