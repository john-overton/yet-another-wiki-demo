'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PasswordResetModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [secretQuestion, setSecretQuestion] = useState('');
  const [questionId, setQuestionId] = useState(null);
  const [secretAnswer, setSecretAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSecretQuestion(data.secretQuestion);
        setQuestionId(data.questionId);
        setStep(2);
      } else {
        setError(data.message || 'Failed to initiate password reset');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, questionId, secretAnswer }),
      });

      if (response.ok) {
        setStep(3);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to verify answer');
      }
    } catch (error) {
      console.error('Answer verification error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      if (response.ok) {
        setSuccess('Password reset successful');
        setTimeout(() => {
          onClose();
          router.push('/login');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
            Reset Password
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 border border-green-400">
              {success}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="ri-mail-send-line"></i>
                    Submit
                  </>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleAnswerSubmit} className="space-y-4">
              <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-400 mb-2">Secret Question:</p>
                <p className="font-semibold text-gray-900 dark:text-white mb-4">{secretQuestion}</p>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Answer
                </label>
                <input
                  type="text"
                  value={secretAnswer}
                  onChange={(e) => setSecretAnswer(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Your answer"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Answer is case sensitive</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Verifying...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line"></i>
                    Verify Answer
                  </>
                )}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <i className="ri-lock-password-line"></i>
                    Reset Password
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
