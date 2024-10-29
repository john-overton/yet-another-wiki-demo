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

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
        // Update last login
        const updateResponse = await fetch('/api/auth/update-last-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!updateResponse.ok) {
          console.error('Failed to update last login');
        }

        router.push('/');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }

    setLoading(false);
  };

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
