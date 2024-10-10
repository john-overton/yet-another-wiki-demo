'use client';

import { useSession } from 'next-auth/react';
import ProtectedRoute from '../components/ProtectedRoute';

function SuccessPage() {
  const { data: session } = useSession();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-white">Success!</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-4">You have successfully logged in.</p>
        <div className="text-gray-600 dark:text-gray-300">
          <p className="font-medium mb-2">Session Information:</p>
          <ul className="list-disc list-inside">
            <li>Name: {session?.user?.name || 'N/A'}</li>
            <li>Email: {session?.user?.email || 'N/A'}</li>
            <li>Role: {session?.user?.role || 'N/A'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedSuccessPage() {
  return (
    <ProtectedRoute>
      <SuccessPage />
    </ProtectedRoute>
  );
}
