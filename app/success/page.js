'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-800 dark:text-white text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-white">Success!</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-2">You have successfully logged in.</p>
        <p className="text-gray-600 dark:text-gray-300 text-center font-medium">
          Welcome, {session?.user?.name || 'User'}!
        </p>
      </div>
    </div>
  );
}