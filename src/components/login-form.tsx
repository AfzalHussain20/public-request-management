'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { t, type Lang } from '@/lib/i18n'

export default function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  const [lang, setLang] = useState<Lang>('en')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(t(lang, 'loginError'))
      setLoading(false)
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          {t(lang, 'login.title')}
        </h1>
        <p className="text-sm text-zinc-600">{t(lang, 'app.tagline')}</p>
      </div>
      <div className="lang-switch">
        {(['en', 'ta'] as Lang[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={lang === l ? 'active' : ''}
          >
            {l === 'en' ? 'English' : 'தமிழ்'}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="card flex w-full flex-col gap-4 p-6">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
          {t(lang, 'email')}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
          {t(lang, 'password')}
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
            autoComplete="current-password"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary py-2.5">
          {loading ? t(lang, 'loading') : t(lang, 'login')}
        </button>
      </form>
    </div>
  )
}
