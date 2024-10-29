'use client';

import { useState, useEffect } from 'react';
import StandardizedComponent, { 
  StandardizedInput, 
  StandardizedButton,
  StandardizedForm
} from './StandardizedComponent';

const SecretQuestionsForm = ({ onComplete }) => {
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

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/secret-questions');
        if (response.ok) {
          const data = await response.json();
          setQuestions(data);
        }
      } catch (error) {
        console.error('Error fetching secret questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        setError('Failed to save security questions');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StandardizedComponent title="Security Questions Setup" error={error}>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        Please set up your security questions. These will be used to verify your identity if you need to reset your password.
      </p>
      <StandardizedForm onSubmit={handleSubmit}>
        {[1, 2, 3].map((num) => (
          <div key={num} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Security Question {num}
            </label>
            <select
              value={selectedQuestions[`question${num}`]}
              onChange={(e) => setSelectedQuestions(prev => ({
                ...prev,
                [`question${num}`]: e.target.value
              }))}
              className="w-full border rounded px-3 py-2 mb-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select a question</option>
              {questions.map(q => (
                <option key={q.id} value={q.id}>{q.question}</option>
              ))}
            </select>
            <StandardizedInput
              type="text"
              value={answers[`answer${num}`]}
              onChange={(e) => setAnswers(prev => ({
                ...prev,
                [`answer${num}`]: e.target.value
              }))}
              placeholder="Your answer"
              required
            />
          </div>
        ))}
        <StandardizedButton type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Security Questions'}
        </StandardizedButton>
      </StandardizedForm>
    </StandardizedComponent>
  );
};

export default SecretQuestionsForm;
