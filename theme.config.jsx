'use client'

import React from 'react'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import UserButton from './app/components/UserButton'
import { px } from 'framer-motion'

const AuthSection = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  if (status === 'loading') {
    return <div>Loading...</div>
    }

  if (status === 'authenticated') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
       <UserButton user={session.user}
        style={{
          borderRadius: '100px'
        }}
        />
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