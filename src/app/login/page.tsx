import type { Metadata } from 'next'
import LoginForm from '@/components/login-form'
import EnvNotConfigured from '@/components/env-not-configured'

export const metadata: Metadata = { title: 'Admin Login' }

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <EnvNotConfigured />
        </div>
      </main>
    )
  }
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </main>
  )
}
