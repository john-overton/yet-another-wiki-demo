'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StandardizedComponent, { 
  StandardizedInput, 
  StandardizedButton, 
  StandardizedLink,
  StandardizedForm
} from './StandardizedComponent';
import SecretQuestionsModal from './SecretQuestionsModal';
import PasswordResetModal from './PasswordResetModal';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSecurityQuestions, setShowSecurityQuestions] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const router = useRouter();

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
        // Check if user has security questions set up
        const userResponse = await fetch('/api/auth/me');
        const userData = await userResponse.json();
        
        // Check if user has NO security questions set up at all
        const hasNoSecurityQuestions = !userData.secret_question_1_id && 
                                     !userData.secret_question_2_id && 
                                     !userData.secret_question_3_id;

        if (hasNoSecurityQuestions) {
          setShowSecurityQuestions(true);
        } else {
          // Update last login and redirect
          await fetch('/api/auth/update-last-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
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
    router.push('/');
  };

  return (
    <>
      <StandardizedComponent title="Login" error={error}>
        <StandardizedForm onSubmit={handleSubmit}>
          <StandardizedInput
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
          <StandardizedInput
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <StandardizedButton type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </StandardizedButton>
        </StandardizedForm>
        <div className="mt-4 text-sm text-center text-gray">
          <p>
            Don&apos;t have an account?{' '}
            <StandardizedLink href="/register">
              Register here
            </StandardizedLink>
          </p>
          <p className="mt-2">
            Forgot your password?{' '}
            <button
              onClick={() => setShowPasswordReset(true)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Reset password
            </button>
          </p>
        </div>
      </StandardizedComponent>

      <SecretQuestionsModal
        isOpen={showSecurityQuestions}
        onClose={() => setShowSecurityQuestions(false)}
        onComplete={handleSecurityQuestionsComplete}
      />

      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
      />
    </>
  );
}
