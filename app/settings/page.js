'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Head from 'next/head';
import Settings from '../components/Settings';

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!session) {
      router.push('/');
    }
  }, [session, router]);

  if (!mounted || !session) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Settings - Yet Another Wiki</title>
      </Head>
      <Settings />
    </>
  );
}
