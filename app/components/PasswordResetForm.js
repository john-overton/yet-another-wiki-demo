'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StandardizedComponent, {
  StandardizedInput,
  StandardizedButton,
  StandardizedForm,
  StandardizedText,
} from './StandardizedComponent';

export default function PasswordResetForm() {
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
    <StandardizedComponent title="Reset Password" error={error} success={success}>
      {step === 1 && (
        <StandardizedForm onSubmit={handleEmailSubmit}>
          <StandardizedInput
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <StandardizedButton type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </StandardizedButton>
        </StandardizedForm>
      )}
      {step === 2 && (
        <StandardizedForm onSubmit={handleAnswerSubmit}>
          <StandardizedText className="mb-2">Secret Question</StandardizedText>
          <StandardizedText className="mb-4 font-semibold">{secretQuestion}</StandardizedText>
          <StandardizedInput
            label="Your Answer"
            id="secretAnswer"
            type="text"
            value={secretAnswer}
            onChange={(e) => setSecretAnswer(e.target.value)}
            required
            placeholder="Your answer"
          />
          <StandardizedText className="text-xs mt-1 mb-4">Answer is case sensitive</StandardizedText>
          <StandardizedButton type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Answer'}
          </StandardizedButton>
        </StandardizedForm>
      )}
      {step === 3 && (
        <StandardizedForm onSubmit={handlePasswordReset}>
          <StandardizedInput
            label="New Password"
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <StandardizedInput
            label="Confirm New Password"
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <StandardizedButton type="submit" disabled={loading}>
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </StandardizedButton>
        </StandardizedForm>
      )}
    </StandardizedComponent>
  );
}
