'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [allSecretQuestions, setAllSecretQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState(['', '', '']);
  const [secretAnswers, setSecretAnswers] = useState(['', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSecretQuestions();
  }, []);

  const fetchSecretQuestions = async () => {
    try {
      const response = await fetch('/api/secret-questions');
      if (response.ok) {
        const questions = await response.json();
        setAllSecretQuestions(questions);
      } else {
        console.error('Failed to fetch secret questions');
      }
    } catch (error) {
      console.error('Error fetching secret questions:', error);
    }
  };

  const getAvailableQuestions = (index) => {
    return allSecretQuestions.filter(q => 
      !selectedQuestions.includes(q.id.toString()) || selectedQuestions[index] === q.id.toString()
    );
  };

  const handleQuestionChange = (index, questionId) => {
    const newSelectedQuestions = [...selectedQuestions];
    newSelectedQuestions[index] = questionId;
    setSelectedQuestions(newSelectedQuestions);
  };

  const handleAnswerChange = (index, answer) => {
    const newSecretAnswers = [...secretAnswers];
    newSecretAnswers[index] = answer;
    setSecretAnswers(newSecretAnswers);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name,
          email, 
          password, 
          secretQuestions: selectedQuestions, 
          secretAnswers 
        }),
      });

      if (response.ok) {
        setSuccess('Registration successful');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">Register</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
        {step === 1 ? (
          <form onSubmit={handleNextStep}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 transition duration-200"
            >
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Secret Questions</h3>
            {[0, 1, 2].map((index) => (
              <div key={index} className="mb-4">
                <label htmlFor={`secretQuestion${index + 1}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Secret Question {index + 1}
                </label>
                <select
                  id={`secretQuestion${index + 1}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={selectedQuestions[index]}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  required
                >
                  <option value="">Select a question</option>
                  {getAvailableQuestions(index).map((question) => (
                    <option key={question.id} value={question.id}>
                      {question.question}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={secretAnswers[index]}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="Your answer"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Answer is case sensitive</p>
              </div>
            ))}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring focus:border-blue-300 transition duration-200"
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 transition duration-200 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  'Register'
                )}
              </button>
            </div>
          </form>
        )}
        <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
