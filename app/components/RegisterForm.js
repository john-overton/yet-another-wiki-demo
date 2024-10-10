'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StandardizedComponent, {
  StandardizedInput,
  StandardizedSelect,
  StandardizedButton,
  StandardizedGreyButton,
  StandardizedLink,
  StandardizedForm,
  StandardizedText
} from './StandardizedComponent';

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
    <StandardizedComponent title="Register" error={error} success={success}>
      {step === 1 ? (
        <StandardizedForm onSubmit={handleNextStep}>
          <StandardizedInput
            label="Name"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <StandardizedInput
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <StandardizedInput
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <StandardizedInput
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <StandardizedButton type="submit">
            Next
          </StandardizedButton>
        </StandardizedForm>
      ) : (
        <StandardizedForm onSubmit={handleRegister}>
          <StandardizedText className="text-lg font-medium mb-4">Secret Questions</StandardizedText>
          {[0, 1, 2].map((index) => (
            <div key={index} className="mb-4">
              <StandardizedSelect
                label={`Secret Question ${index + 1}`}
                id={`secretQuestion${index + 1}`}
                value={selectedQuestions[index]}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                options={getAvailableQuestions(index).map(q => ({ value: q.id, label: q.question }))}
                required
              />
              <StandardizedInput
                label={`Answer ${index + 1}`}
                id={`secretAnswer${index + 1}`}
                type="text"
                value={secretAnswers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                placeholder="Your answer"
                required
              />
              <StandardizedText className="text-xs mt-1">Answer is case sensitive</StandardizedText>
            </div>
          ))}
          <div className="flex justify-between space-x-4">
            <StandardizedGreyButton type="button" onClick={() => setStep(1)}>
              Back
            </StandardizedGreyButton>
            <StandardizedButton type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </StandardizedButton>
          </div>
        </StandardizedForm>
      )}
      <StandardizedText className="mt-4 text-sm text-center">
        Already have an account?{' '}
        <StandardizedLink href="/login">
          Log in here
        </StandardizedLink>
      </StandardizedText>
    </StandardizedComponent>
  );
}
