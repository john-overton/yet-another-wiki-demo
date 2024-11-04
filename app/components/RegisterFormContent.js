'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function RegisterFormContent({ onBackToLogin, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const router = useRouter();

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
    setFormData(prev => ({ ...prev, email: newEmail }));
    
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
      const createResponse = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          auth_type: 'credentials',
          role: 'user',
          is_active: true,
          voting_rights: false,
          avatar: null
        }),
      });

      if (createResponse.ok) {
        // After successful registration, sign in the user
        const result = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (result.error) {
          setError('Account created but failed to log in. Please try logging in manually.');
          onBackToLogin();
        } else {
          // Now that the user is signed in, proceed to security questions
          onRegisterSuccess();
        }
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
    <>
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
          {emailError && (
            <div className="text-sm text-red-500 dark:text-red-400 mb-1">
              {emailError}
            </div>
          )}
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleEmailChange}
              className={`w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 ${
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
          disabled={loading || !isEmailValid || isCheckingEmail}
          className={`w-full px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black rounded-lg flex items-center justify-center gap-2 ${
            !isEmailValid || isCheckingEmail || loading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
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

        <div className="text-sm text-center text-gray-600 dark:text-gray-400">
          <button
            onClick={() => {
              setError('');
              onBackToLogin();
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to Login
          </button>
        </div>
      </form>
    </>
  );
}
