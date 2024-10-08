'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : null;
}

// Usage in a protected page (e.g., app/dashboard/page.js)
import ProtectedRoute from '../components/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        {/* Dashboard content */}
      </div>
    </ProtectedRoute>
  );
}