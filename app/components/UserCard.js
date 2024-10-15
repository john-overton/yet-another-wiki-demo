'use client';

import Image from 'next/image';

export default function UserCard({ user }) {
  if (!user) return null;

  const avatarSrc = user.avatar || '/images/default-avatar.png'; // Assuming we have a default avatar image

  return (
    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md flex items-center space-x-4 mb-4">
      <div className="flex-shrink-0">
        <Image
          src={avatarSrc}
          alt={user.name}
          width={50}
          height={50}
          className="rounded-full"
        />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user.name}</h2>
        <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
      </div>
    </div>
  );
}
