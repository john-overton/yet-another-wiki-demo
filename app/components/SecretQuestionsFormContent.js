'use client';

import { useState, useEffect } from 'react';

export default function SecretQuestionsFormContent({ onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState({
    question1: '',
    question2: '',
    question3: '',
  });
  const [answers, setAnswers] = useState({
    answer1: '',
    answer2: '',
    answer3: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserAndQuestions = async () => {
      try {
        // Fetch current user
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserId(userData.id);
        }

        // Fetch questions
        const questionsResponse = await fetch('/api/secret-questions');
        if (questionsResponse.ok) {
          const data = await questionsResponse.json();
          setQuestions(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUserAndQuestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!userId) {
      setError('User ID not found. Please try logging in again.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          secret_question_1_id: parseInt(selectedQuestions.question1),
          secret_answer_1: answers.answer1,
          secret_question_2_id: parseInt(selectedQuestions.question2),
          secret_answer_2: answers.answer2,
          secret_question_3_id: parseInt(selectedQuestions.question3),
          secret_answer_3: answers.answer3,
        }),
      });

      if (response.ok) {
        onComplete();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save security questions');
      }
    } catch (error) {
      console.error('Error saving security questions:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get available questions for each dropdown
  const getAvailableQuestions = (questionNumber) => {
    // Start with all questions
    let availableQuestions = [...questions];

    // Remove questions selected in other dropdowns
    Object.entries(selectedQuestions).forEach(([key, value]) => {
      // Skip the current dropdown and empty selections
      if (key !== `question${questionNumber}` && value) {
        availableQuestions = availableQuestions.filter(q => q.id !== parseInt(value));
      }
    });

    return availableQuestions;
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Security Questions Setup
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-400">
          {error}
        </div>
      )}

      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Please set up your security questions. These will be used to verify your identity if you need to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[1, 2, 3].map((num) => (
          <div key={num} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Security Question {num}
            </label>
            <select
              value={selectedQuestions[`question${num}`]}
              onChange={(e) => setSelectedQuestions(prev => ({
                ...prev,
                [`question${num}`]: e.target.value
              }))}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 mb-2"
              required
            >
              <option value="">Select a question</option>
              {getAvailableQuestions(num).map(q => (
                <option key={q.id} value={q.id}>{q.question}</option>
              ))}
            </select>
            <input
              type="text"
              value={answers[`answer${num}`]}
              onChange={(e) => setAnswers(prev => ({
                ...prev,
                [`answer${num}`]: e.target.value
              }))}
              placeholder="Your answer"
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="ri-save-line"></i>
              Save Security Questions
            </>
          )}
        </button>
      </form>
    </>
  );
}
