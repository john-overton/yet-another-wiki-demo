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
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f6f6]">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-[#076bf8] mb-4">Success!</h1>
        <p className="text-gray-600">You have successfully logged in.</p>
        <p className="mt-2 text-gray-600">Welcome, {session?.user?.name || 'User'}!</p>
      </div>
    </div>
  );
}