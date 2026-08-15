'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { t, type Lang } from '@/lib/i18n'

type View = 'checking' | 'login' | 'setPassword' | 'reset'

export default function LoginForm() {
  const router = useRouter()
  const fromLink = useRef<boolean | undefined>(undefined)
  if (fromLink.current === undefined) {
    fromLink.current =
      typeof window !== 'undefined' &&
      (window.location.hash.includes('access_token') || window.location.hash.includes('type='))
  }
  const supabase = createClient()
  const [lang, setLang] = useState<Lang>('en')
  const [view, setView] = useState<View>('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        if (fromLink.current) {
          setView('setPassword')
        } else {
          router.push('/admin')
          router.refresh()
        }
        return
      }
      setView('login')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) return
      if (fromLink.current) {
        setView('setPassword')
      } else {
        router.push('/admin')
        router.refresh()
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [supabase, router])

  if (view === 'checking') {
    return (
      <div className="flex justify-center py-10 text-sm text-zinc-600">{t(lang, 'loading')}</div>
    )
  }

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

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    if (newPassword.length < 6) {
      setPwError(t(lang, 'passwordTooShort'))
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError(t(lang, 'passwordMismatch'))
      return
    }
    setPwLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPwError(t(lang, 'tryAgain'))
      setPwLoading(false)
      return
    }
    router.push('/admin')
    router.refresh()
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setResetMsg('')
    setResetError('')
    if (!resetEmail) {
      setResetError(t(lang, 'required'))
      return
    }
    setResetLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || ''}/login`,
    })
    setResetLoading(false)
    if (error) {
      setResetError(t(lang, 'tryAgain'))
      return
    }
    setResetMsg(t(lang, 'resetSent'))
  }

  function goToLogin() {
    setView('login')
    setError('')
    setResetMsg('')
    setResetError('')
  }

  const titles: Record<View, string> = {
    checking: t(lang, 'login.title'),
    login: t(lang, 'login.title'),
    setPassword: t(lang, 'setPassword.title'),
    reset: t(lang, 'resetPassword'),
  }

  const taglines: Record<View, string> = {
    checking: t(lang, 'app.tagline'),
    login: t(lang, 'app.tagline'),
    setPassword: t(lang, 'setPassword.subtitle'),
    reset: '',
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{titles[view]}</h1>
        {taglines[view] && <p className="text-sm text-zinc-600">{taglines[view]}</p>}
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

      {view === 'login' && (
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
          <button
            type="button"
            onClick={() => setView('reset')}
            className="self-start text-sm font-medium text-blue-600 hover:underline"
          >
            {t(lang, 'forgotPassword')}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary py-2.5">
            {loading ? t(lang, 'loading') : t(lang, 'login')}
          </button>
        </form>
      )}

      {view === 'setPassword' && (
        <form onSubmit={handleSetPassword} className="card flex w-full flex-col gap-4 p-6">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
            {t(lang, 'newPassword')}
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="field-input"
              autoComplete="new-password"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
            {t(lang, 'confirmPassword')}
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="field-input"
              autoComplete="new-password"
            />
          </label>
          {pwError && <p className="text-sm text-red-600">{pwError}</p>}
          <button type="submit" disabled={pwLoading} className="btn btn-primary py-2.5">
            {pwLoading ? t(lang, 'saving') : t(lang, 'savePassword')}
          </button>
        </form>
      )}

      {view === 'reset' && (
        <form onSubmit={handleForgotPassword} className="card flex w-full flex-col gap-4 p-6">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
            {t(lang, 'email')}
            <input
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="field-input"
              autoComplete="email"
            />
          </label>
          {resetError && <p className="text-sm text-red-600">{resetError}</p>}
          {resetMsg && <p className="text-sm text-green-700">{resetMsg}</p>}
          <button type="submit" disabled={resetLoading} className="btn btn-primary py-2.5">
            {resetLoading ? t(lang, 'loading') : t(lang, 'resetPassword')}
          </button>
          <button
            type="button"
            onClick={goToLogin}
            className="self-center text-sm font-medium text-blue-600 hover:underline"
          >
            {t(lang, 'backToLogin')}
          </button>
        </form>
      )}
    </div>
  )
}
