'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SecretQuestionsForm from './SecretQuestionsForm';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsSecurityQuestions, setNeedsSecurityQuestions] = useState(false);
  const router = useRouter();

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setLoading(false);
      setNeedsSecurityQuestions(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        setError('Invalid email or password');
      } else {
        const userResponse = await fetch('/api/auth/me');
        const userData = await userResponse.json();
        
        const hasNoSecurityQuestions = !userData.secret_question_1_id && 
                                     !userData.secret_question_2_id && 
                                     !userData.secret_question_3_id;

        if (hasNoSecurityQuestions) {
          setNeedsSecurityQuestions(true);
        } else {
          await fetch('/api/auth/update-last-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          onClose();
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  const handleSecurityQuestionsComplete = () => {
    onClose();
    router.push('/');
  };

  if (needsSecurityQuestions) {
    return <SecretQuestionsForm onComplete={handleSecurityQuestionsComplete} />;
  }

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
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Login</h2>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                required
                autoComplete="current-password"
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
                  Logging in...
                </>
              ) : (
                <>
                  <i className="ri-login-box-line"></i>
                  Log In
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Register here
              </Link>
            </p>
            <p className="mt-2">
              Forgot your password?{' '}
              <Link href="/reset-password" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Reset password
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
