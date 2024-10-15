import dynamic from 'next/dynamic';

const MainAppLayout = dynamic(() => import('../components/MainAppLayout'), { ssr: false });

export default function MainApp() {
  return (
    <div className="h-screen">
      <MainAppLayout />
    </div>
  );
}
