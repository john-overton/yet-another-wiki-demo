import React from 'react'
import { useRouter } from 'next/router'

const LoginButton = () => {
  const router = useRouter()
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
    extraContent: <LoginButton />
  }
  // ... other theme options
}
