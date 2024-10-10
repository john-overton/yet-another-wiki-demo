import React from 'react'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import UserCard from './app/components/UserCard'
import { SessionProvider } from "next-auth/react"

const AuthSection = () => {
  const router = useRouter()
  const { data: session, status } = <SessionProvider>useSession()</SessionProvider>

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'authenticated') {
    return (
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
       <UserCard user={session.user} />
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      
    )
  }

  return (
    <button
      onClick={() => router.push('/login')}
      style={{
        padding: '8px 16px',
        backgroundColor: '#0070f3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Login
    </button>
  )
}

export default {
  logo: <span>My Nextra Documentation</span>,
  project: {
    link: 'https://github.com/shuding/nextra'
  },
  navbar: {
    extraContent: <AuthSection />
  }
  // ... other theme options
}