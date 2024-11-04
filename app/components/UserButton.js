'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import UserSettingsModal from './UserSettingsModal';

export default function UserButton({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now());
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Listen for avatar updates with timestamp
    const handleAvatarUpdate = (event) => {
      // Use the timestamp from the event if available, otherwise generate new one
      const newTimestamp = event.detail?.timestamp || Date.now();
      setTimestamp(newTimestamp);
      setAvatarError(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('user-avatar-updated', handleAvatarUpdate);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('user-avatar-updated', handleAvatarUpdate);
    };
  }, []);

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
    
    if (avatar.startsWith('data:')) {
      return avatar;
    }
    
    // Convert filename to dynamic API path
    const filename = avatar.includes('/') 
      ? avatar.split('/').pop() 
      : avatar;
    
    // Use the shared timestamp for cache busting
    return `/api/uploads/user-avatars/${filename}?t=${timestamp}`;
  };

  const avatarUrl = getAvatarUrl(user.avatar);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none"
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={`Logged in as ${user.name}, ${user.email}`}
      >
        {avatarUrl && !avatarError ? (
          <div className="relative h-10 w-10 rounded-full overflow-hidden">
            <Image
              src={avatarUrl}
              alt={user.name}
              className="object-cover"
              fill
              sizes="40px"
              onError={() => setAvatarError(true)}
              unoptimized={true}
              priority
              key={timestamp} // Force remount when timestamp changes
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
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
            onClick={() => {
              setShowSettingsModal(true);
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Logout
          </button>
        </div>
      )}

      <UserSettingsModal
        user={user}
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}
