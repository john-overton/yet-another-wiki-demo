import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      avatar: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role: string
    avatar: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    avatar: string | null
  }
}