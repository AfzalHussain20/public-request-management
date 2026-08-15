import Link from 'next/link'
import LogoutButton from '@/components/admin-logout'
import EnvNotConfigured from '@/components/env-not-configured'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const envReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-semibold text-zinc-900">
            Admin · Public Requests
          </Link>
          {envReady && <LogoutButton />}
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {!envReady ? <EnvNotConfigured /> : children}
      </div>
    </div>
  )
}
