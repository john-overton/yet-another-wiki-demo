import dynamic from 'next/dynamic';

const MainAppLayout = dynamic(() => import('../components/MainAppLayout'), { ssr: false });

export default function Page() {
  return <MainAppLayout />;
}
