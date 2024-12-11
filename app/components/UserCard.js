'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function UserCard({ user }) {
  const [avatarError, setAvatarError] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffect(() => {
    const handleAvatarUpdate = () => {
      setTimestamp(Date.now());
      setAvatarError(false);
    };

    window.addEventListener('user-avatar-updated', handleAvatarUpdate);
    return () => window.removeEventListener('user-avatar-updated', handleAvatarUpdate);
  }, []);

  if (!user) return null;

  const getAvatarSrc = () => {
    if (!user.avatar) return null;
    if (user.avatar.startsWith('data:')) return user.avatar;
    
    // Convert filename to dynamic API path
    const filename = user.avatar.includes('/') 
      ? user.avatar.split('/').pop() 
      : user.avatar;
    
    return `/api/uploads/user-avatars/${filename}?t=${timestamp}`;
  };

  const avatarSrc = getAvatarSrc();

  return (
    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md flex items-center space-x-4 mb-4">
      <div className="flex-shrink-0">
        {avatarSrc && !avatarError ? (
          <div className="relative h-[50px] w-[50px] rounded-full overflow-hidden">
            <Image
              src={avatarSrc}
              alt={user.name}
              className="object-cover"
              fill
              sizes="50px"
              onError={() => setAvatarError(true)}
              unoptimized={true}
              priority
              key={timestamp}
            />
          </div>
        ) : (
          <div className="h-[50px] w-[50px] rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <i className="ri-user-line text-xl text-gray-500 dark:text-gray-400"></i>
          </div>
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user.name}</h2>
        <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
      </div>
    </div>
  );
}
