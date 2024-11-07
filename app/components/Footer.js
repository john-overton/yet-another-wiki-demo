'use client';

const Footer = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
      <div className="grid grid-cols-2 h-[20rem] sm:grid-cols-2">
        {/* Left Box */}
        <div className="flex items-center justify-center sm:w-full md:w-full lg:w-full xl:w-full">
          <div className="text-6xl font-bold text-gray-800 dark:text-gray-200">
            Y.A.W.
          </div>
        </div>

        {/* Right Box */}
        <div className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400">
          <div className="font-semibold mb-4">Quick Links</div>
          <div className="flex flex-col gap-4 items-center">
            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">Documentation</a>
            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">Getting Started</a>
            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">API Reference</a>
            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">Support</a>
            <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200">Community</a>
          </div>
        </div>
      </div>

      {/* Bottom Box */}
      <div className="h-12 flex items-center justify-center">
        <div className="text-xs text-gray-600 dark:text-gray-400">© 2024 - Yet Another Wiki - All Rights Reserved</div>
      </div>
    </div>
  );
};

export default Footer;
