'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return session ? children : null;
}

// Usage in a protected page (e.g., app/dashboard/page.js)
// import ProtectedRoute from '../components/ProtectedRoute';
//
// export default function Dashboard() {
//   return (
//     <ProtectedRoute>
//       <div>
//         <h1>Dashboard</h1>
//         {/* Dashboard content */}
//       </div>
//     </ProtectedRoute>
//   );
// }
