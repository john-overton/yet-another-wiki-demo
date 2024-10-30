'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function UserButton({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const router = useRouter();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) {
      return null;
    }
    
    if (avatar.startsWith('http')) {
      return avatar;
    } else if (avatar.startsWith('/')) {
      return avatar;
    } else {
      return `/user-avatars/${avatar}`;
    }
  };

  const avatarUrl = getAvatarUrl(user.avatar);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none"
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={`Logged in as ${user.name}, ${user.email}`}
      >
        {avatarUrl && !avatarError ? (
          <img
            src={avatarUrl}
            alt={user.name}
            className="h-[40px] w-[40px] mt-1 rounded-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="h-[30px] w-[30px] rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <i className="ri-user-line text-gray-500 dark:text-gray-400"></i>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
