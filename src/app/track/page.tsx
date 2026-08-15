'use client'

import { useState } from 'react'
import Link from 'next/link'
import { t, STATUS_LABELS, type Lang } from '@/lib/i18n'
import type { RequestStatus } from '@/lib/types'

type Category = { name_en: string; name_ta: string } | null

type TrackedRequest = {
  request_number: string
  status: RequestStatus
  subject: string
  description: string
  category: Category
  created_at: string
  updated_at: string
}

const statusColor: Record<RequestStatus, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-violet-100 text-violet-700',
  RESOLVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  DUPLICATE: 'bg-zinc-200 text-zinc-700',
}

export default function TrackPage() {
  const [lang, setLang] = useState<Lang>('ta')
  const [requestNumber, setRequestNumber] = useState('')
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TrackedRequest | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setNotFound(false)
    setError('')
    setResult(null)
    try {
      const params = new URLSearchParams({ request_number: requestNumber.trim(), mobile: mobile.trim() })
      const res = await fetch(`/api/track?${params.toString()}`)
      const data = await res.json()
      if (res.ok && data.ok) {
        setResult(data.request as TrackedRequest)
      } else if (res.status === 404) {
        setNotFound(true)
      } else {
        setError(t(lang, 'tryAgain'))
      }
    } catch {
      setError(t(lang, 'tryAgain'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <div className="lang-switch">
          {(['ta', 'en'] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={lang === l ? 'active' : ''}>
              {l === 'ta' ? 'தமிழ்' : 'English'}
            </button>
          ))}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{t(lang, 'track.title')}</h1>
        <p className="text-sm text-zinc-600">{t(lang, 'track.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="card flex w-full max-w-md flex-col gap-4 p-6">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-800">
          {t(lang, 'requestId')}
          <input
            value={requestNumber}
            onChange={(e) => setRequestNumber(e.target.value)}
            className="field-input"
            placeholder="PRM0001"
            required
            autoCapitalize="characters"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-800">
          {t(lang, 'mobile')}
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="field-input"
            placeholder="9876543210"
            required
            inputMode="numeric"
          />
        </label>
        {notFound && <p className="text-sm text-red-600">{t(lang, 'track.notFound')}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary py-2.5">
          {loading ? t(lang, 'loading') : t(lang, 'track.button')}
        </button>
      </form>

      {result && (
        <div className="card flex w-full max-w-md flex-col gap-3 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-zinc-900">{result.request_number}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[result.status]}`}>
              {STATUS_LABELS[result.status][lang]}
            </span>
          </div>
          <p className="text-zinc-800">{result.subject}</p>
          {result.description && <p className="text-sm text-zinc-600">{result.description}</p>}
          {result.category && (
            <p className="text-sm text-zinc-600">
              {t(lang, 'category')}:{' '}
              <span className="text-zinc-800">
                {lang === 'ta' && result.category.name_ta ? result.category.name_ta : result.category.name_en}
              </span>
            </p>
          )}
          <div className="flex flex-col gap-1 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
            <span>
              {t(lang, 'createdAt')}: {new Date(result.created_at).toLocaleString()}
            </span>
            <span>
              {t(lang, 'updatedAt')}: {new Date(result.updated_at).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← {t(lang, 'backHome')}
      </Link>
    </main>
  )
}
