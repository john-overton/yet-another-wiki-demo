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
import SecretQuestionsForm from './SecretQuestionsForm';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsSecurityQuestions, setNeedsSecurityQuestions] = useState(false);
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
        
        // Debug logging
        console.log('User data from /api/auth/me:', userData);
        console.log('Security questions:', {
          q1: userData.secret_question_1_id,
          q2: userData.secret_question_2_id,
          q3: userData.secret_question_3_id
        });

        // Check if user has NO security questions set up at all
        const hasNoSecurityQuestions = !userData.secret_question_1_id && 
                                     !userData.secret_question_2_id && 
                                     !userData.secret_question_3_id;

        console.log('Has no security questions:', hasNoSecurityQuestions);

        if (hasNoSecurityQuestions) {
          console.log('Setting needsSecurityQuestions to true');
          setNeedsSecurityQuestions(true);
        } else {
          console.log('User has security questions, updating last login and redirecting');
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

  if (needsSecurityQuestions) {
    return <SecretQuestionsForm onComplete={handleSecurityQuestionsComplete} />;
  }

  return (
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
          Don't have an account?{' '}
          <StandardizedLink href="/register">
            Register here
          </StandardizedLink>
        </p>
        <p className="mt-2">
          Forgot your password?{' '}
          <StandardizedLink href="/reset-password">
            Reset password
          </StandardizedLink>
        </p>
      </div>
    </StandardizedComponent>
  );
}
