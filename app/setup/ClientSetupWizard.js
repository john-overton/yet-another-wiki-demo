'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SecretQuestionsFormContent from '../components/SecretQuestionsFormContent';
import SetupLicensing from '../components/SetupLicensing';
import SetupHeader from '../components/SetupHeader';

export default function ClientSetupWizard() {
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
    const [showSecurityQuestions, setShowSecurityQuestions] = useState(false);
    const [showLicensing, setShowLicensing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const router = useRouter();

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
                    auth_type: 'local',
                    role: 'Admin', // First user is always admin
                    is_active: true,
                    active: 1,
                    voting_rights: false,
                    avatar: null
                }),
            });

            if (createResponse.ok) {
                const result = await signIn('credentials', {
                    redirect: false,
                    email: formData.email,
                    password: formData.password,
                });

                if (result.error) {
                    setError('Account created but failed to log in. Please try logging in manually.');
                    router.push('/auth/signin');
                } else {
                    setShowSecurityQuestions(true);
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

    const handleSecurityQuestionsComplete = () => {
        setShowSecurityQuestions(false);
        setShowLicensing(true);
    };

    const handleLicensingComplete = () => {
        router.push('/');
    };

    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('backup', file);
            formData.append('isSetup', 'true'); // Add flag to indicate this is a setup import

            const response = await fetch('/api/backup/restore', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || `Failed to restore backup: ${response.status} ${response.statusText}`);
            }

            // Redirect to home page after successful import
            router.push('/');
        } catch (error) {
            console.error('Error importing backup:', error);
            setError(error.message);
            setIsImporting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="h-12 p-1 flex justify-end overflow-visible bg-gray-100 dark:bg-gray-800 transition-colors duration-200 border-gray-header shadow-lg z-[2000]">
                <SetupHeader />
            </header>
            <div className="flex-1 flex items-center justify-center">
                <div className="max-w-md w-full space-y-8 p-8 border bg-white dark:bg-gray-800 dark:border-gray-600 rounded-lg shadow">
                    {showLicensing ? (
                        <SetupLicensing onComplete={handleLicensingComplete} />
                    ) : showSecurityQuestions ? (
                        <SecretQuestionsFormContent onComplete={handleSecurityQuestionsComplete} />
                    ) : (
                        <>
                            <div>
                                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                                    Welcome to Yet Another Wiki!
                                </h2>
                                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                                    Please set up your admin account
                                </p>
                            </div>

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
                                        className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
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
                                            className={`w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 ${
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
                                        className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
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
                                            Creating Admin Account...
                                        </>
                                    ) : (
                                        <>
                                            <i className="ri-user-add-line"></i>
                                            Create Admin Account
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    Or import your existing data
                                </p>
                                <div className="flex flex-col items-center space-y-4">
                                    <input
                                        type="file"
                                        accept=".zip"
                                        onChange={handleImport}
                                        className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                        disabled={isImporting}
                                    />
                                    {isImporting && (
                                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                            <i className="ri-loader-4-line animate-spin mr-2"></i>
                                            Importing data...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <footer className="h-12 flex items-center justify-center">
                <div className="text-gray-600 dark:text-gray-400">© 2024 - Yet Another Wiki - All Rights Reserved</div>
            </footer>
        </div>
    );
}
