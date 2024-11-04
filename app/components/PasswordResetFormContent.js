'use client';

import { useState } from 'react';

export default function PasswordResetFormContent({ onBackToLogin, onResetSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    step: 1,
    secretQuestion: '',
    questionId: null,
    secretAnswer: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.step === 1) {
        const response = await fetch('/api/auth/reset-password/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });

        const data = await response.json();

        if (response.ok) {
          setFormData(prev => ({
            ...prev,
            secretQuestion: data.secretQuestion,
            questionId: Number(data.questionId), // Ensure questionId is a number
            step: 2,
          }));
        } else {
          setError(data.message || 'Failed to initiate password reset');
        }
      } else if (formData.step === 2) {
        const response = await fetch('/api/auth/reset-password/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            questionId: Number(formData.questionId), // Ensure questionId is a number when sending
            secretAnswer: formData.secretAnswer,
          }),
        });

        if (response.ok) {
          setFormData(prev => ({ ...prev, step: 3 }));
        } else {
          const data = await response.json();
          setError(data.message || 'Failed to verify answer');
        }
      } else if (formData.step === 3) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/auth/reset-password/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            newPassword: formData.newPassword,
          }),
        });

        if (response.ok) {
          onResetSuccess(formData.email);
        } else {
          const data = await response.json();
          setError(data.message || 'Failed to reset password');
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
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
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Reset Password</h2>
      
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {formData.step === 1 && (
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
        )}

        {formData.step === 2 && (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Secret Question:</p>
            <p className="font-semibold text-gray-900 dark:text-white mb-4">{formData.secretQuestion}</p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Answer
            </label>
            <input
              type="text"
              name="secretAnswer"
              value={formData.secretAnswer}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Answer is case sensitive</p>
          </div>
        )}

        {formData.step === 3 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
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
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin"></i>
              {formData.step === 1 ? 'Submitting...' : 
                formData.step === 2 ? 'Verifying...' : 
                'Resetting Password...'}
            </>
          ) : (
            <>
              <i className={formData.step === 1 ? 'ri-mail-send-line' : 
                formData.step === 2 ? 'ri-check-line' : 
                'ri-lock-password-line'}></i>
              {formData.step === 1 ? 'Submit' : 
                formData.step === 2 ? 'Verify Answer' : 
                'Reset Password'}
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
