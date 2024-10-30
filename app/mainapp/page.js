import { Suspense } from 'react';
import { ClientLayout } from '../components/ClientLayout';
import MainAppLayout from '../components/MainAppLayout';

export default function MainAppPage() {
  return (
    <ClientLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <MainAppLayout />
      </Suspense>
    </ClientLayout>
  );
}
