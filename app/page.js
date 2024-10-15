'use client';

export default function Home() {
  return (
    <div className="grid grid-cols-[20%_60%_20%] gap-4 p-4 h-full">
      <div className="main-app-div main-app-div-left">
        <h2 className="text-2xl font-semibold mb-4">Left Div (20%)</h2>
        <p className="text-gray-600 dark:text-gray-300">Content for the left section</p>
      </div>
      
      <div className="main-app-div main-app-div-center">
        <h2 className="text-2xl font-semibold mb-4">Center Div (60%)</h2>
        <p className="text-gray-600 dark:text-gray-300">Content for the center section</p>
      </div>
      
      <div className="main-app-div main-app-div-right">
        <h2 className="text-2xl font-semibold mb-4">Right Div (20%)</h2>
        <p className="text-gray-600 dark:text-gray-300">Content for the right section</p>
      </div>
    </div>
  );
}
