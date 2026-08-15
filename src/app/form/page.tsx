import type { Metadata } from 'next'
import PublicForm from '@/components/public-form'
import EnvNotConfigured from '@/components/env-not-configured'

export const metadata: Metadata = { title: 'Submit a Request' }

export const dynamic = 'force-dynamic'

export default function FormPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return (
      <main className="flex flex-1 justify-center px-4 py-6">
        <div className="w-full max-w-xl">
          <EnvNotConfigured />
        </div>
      </main>
    )
  }
  return (
    <main className="flex flex-1 justify-center px-4 py-6">
      <div className="w-full max-w-xl">
        <PublicForm />
      </div>
    </main>
  )
}
