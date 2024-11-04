'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterForm({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Check if email already exists
      const emailCheckResponse = await fetch('/api/users/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const emailCheckData = await emailCheckResponse.json();

      if (!emailCheckResponse.ok) {
        throw new Error(emailCheckData.message || 'Failed to check email');
      }

      if (emailCheckData.exists) {
        setError('Email already exists');
        setLoading(false);
        return;
      }

      // Create user
      const createResponse = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (createResponse.ok) {
        onClose();
        router.push('/login');
      } else {
        const errorData = await createResponse.json();
        setError(errorData.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div 
        className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl" 
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
        >
          <i className="ri-close-line text-xl"></i>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Register</h2>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="ri-user-add-line"></i>
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
