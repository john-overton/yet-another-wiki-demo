'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import RegisterFormContent from './RegisterFormContent';
import PasswordResetFormContent from './PasswordResetFormContent';
import SecretQuestionsFormContent from './SecretQuestionsFormContent';

/**
 * @typedef {Object} LoginModalProps
 * @property {boolean} [isOpen]
 * @property {() => void} [onClose]
 * @property {boolean} [isStandalone]
 * @property {Record<string, any>} [providers]
 */

/**
 * @param {LoginModalProps} props
 */
export default function LoginModal({ isOpen, onClose, isStandalone = false, providers = null }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeForm, setActiveForm] = useState('login');
  const [licenseType, setLicenseType] = useState(null);
  const router = useRouter();

  // Fetch license type when modal is opened
  useEffect(() => {
    const fetchLicenseType = async () => {
      try {
        const response = await fetch('/api/settings/licensing');
        if (response.ok) {
          const data = await response.json();
          setLicenseType(data.licenseType);
        }
      } catch (error) {
        console.error('Error fetching license type:', error);
      }
    };

    if (isOpen || isStandalone) {
      fetchLicenseType();
    }
  }, [isOpen, isStandalone]);

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen || isStandalone) {
      setEmail('');
      setPassword('');
      setError('');
      setSuccessMessage('');
      setLoading(false);
      setActiveForm('login');
    }
  }, [isOpen, isStandalone]);

  if (!isOpen && !isStandalone) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      // Add a small delay to allow the session to be established
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const userResponse = await fetch('/api/auth/me');
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await userResponse.json();
        const hasNoSecurityQuestions = !userData.secret_question_1_id && 
                                     !userData.secret_question_2_id && 
                                     !userData.secret_question_3_id;

        if (hasNoSecurityQuestions) {
          setActiveForm('security');
        } else {
          await fetch('/api/auth/update-last-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (!isStandalone && onClose) onClose();
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  const handleSecurityQuestionsComplete = () => {
    if (!isStandalone && onClose) onClose();
    router.push('/');
  };

  const handleRegisterSuccess = (registeredEmail) => {
    setEmail(registeredEmail);
    setPassword('');
    setActiveForm('login');
  };

  const handleResetSuccess = (resetEmail) => {
    setEmail(resetEmail);
    setPassword('');
    setSuccessMessage('Password was successfully changed. Please log in with your new password.');
    setActiveForm('login');
  };

  const content = (
    <div className="p-6">
      {activeForm === 'login' && (
        <>
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Login</h2>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-400">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 border border-green-400">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
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
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
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
            {licenseType === 'pro' && (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => {
                    setError('');
                    setSuccessMessage('');
                    setActiveForm('register');
                  }}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Register here
                </button>
              </p>
            )}
            <p className={licenseType === 'pro' ? 'mt-2' : ''}>
              Forgot your password?{' '}
              <button
                onClick={() => {
                  setError('');
                  setSuccessMessage('');
                  setActiveForm('reset');
                }}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Reset password
              </button>
            </p>
          </div>
        </>
      )}

      {activeForm === 'register' && licenseType === 'pro' && (
        <RegisterFormContent
          onBackToLogin={() => setActiveForm('login')}
          onRegisterSuccess={() => setActiveForm('security')}
        />
      )}

      {activeForm === 'reset' && (
        <PasswordResetFormContent
          onBackToLogin={() => setActiveForm('login')}
          onResetSuccess={handleResetSuccess}
        />
      )}

      {activeForm === 'security' && (
        <SecretQuestionsFormContent
          onComplete={handleSecurityQuestionsComplete}
        />
      )}
    </div>
  );

  if (isStandalone) {
    return (
      <div className="w-full max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {content}
      </div>
    );
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
        {content}
      </div>
    </div>
  );
}
