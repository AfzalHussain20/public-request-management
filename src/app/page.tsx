'use client'

import { useState } from 'react'
import Link from 'next/link'
import { t, type Lang } from '@/lib/i18n'
import QrCode from '@/components/qr-code'

export default function Home() {
  const [lang, setLang] = useState<Lang>('ta')
  const base = process.env.NEXT_PUBLIC_APP_URL || ''
  const formUrl = `${base}/form`

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="lang-switch">
          {(['ta', 'en'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={lang === l ? 'active' : ''}
            >
              {l === 'ta' ? 'தமிழ்' : 'English'}
            </button>
          ))}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{t(lang, 'app.name')}</h1>
        <p className="text-zinc-600">{t(lang, 'app.tagline')}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/form" className="btn btn-primary px-6 py-3 text-base">
          {t(lang, 'submitRequest')}
        </Link>
        <Link href="/track" className="btn btn-secondary px-6 py-3 text-base">
          {t(lang, 'track')}
        </Link>
        <Link href="/login" className="btn btn-secondary px-6 py-3 text-base">
          {t(lang, 'adminLogin')}
        </Link>
      </div>
      {base && (
        <div className="mt-2">
          <QrCode url={formUrl} />
        </div>
      )}
    </main>
  )
}
