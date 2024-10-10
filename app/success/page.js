'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

function SuccessPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-800 dark:text-white text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96 text-center">
          <h1 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Not Logged In</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">You are not currently logged in.</p>
          <Link href="/login" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
            Go to Login Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-white">Success!</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-4">You are logged in.</p>
        <div className="text-gray-600 dark:text-gray-300 mb-6">
          <p className="font-medium mb-2">Session Information:</p>
          <ul className="list-disc list-inside">
            <li>Name: {session?.user?.name || 'N/A'}</li>
            <li>Email: {session?.user?.email || 'N/A'}</li>
            <li>Role: {session?.user?.role || 'N/A'}</li>
          </ul>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default SuccessPage;
