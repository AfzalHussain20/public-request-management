'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { t, ALL_STATUSES, STATUS_LABELS, type Lang, type TranslationKey } from '@/lib/i18n'
import type { RequestStatus } from '@/lib/types'
import { whatsAppDeepLink, buildWhatsAppMessage } from '@/lib/receipt'

type NamePair = { name_en: string; name_ta: string }

type Attachment = { id: string; file_name: string; file_path: string; file_type: string; file_size: number }

type RequestRow = {
  id: string
  request_number: string
  name: string
  initial: string
  mobile: string
  alternate_mobile: string | null
  address: string
  subject: string
  description: string
  status: RequestStatus
  internal_notes: string
  assigned_to: string | null
  created_at: string
  updated_at: string
  district: NamePair | null
  taluk: NamePair | null
  local_body: NamePair | null
  ward: NamePair | null
  assembly_constituency: NamePair | null
  parliament_constituency: NamePair | null
  category: NamePair | null
  assignee: { name: string } | null
  attachments: Attachment[]
}

type Staff = { id: string; name: string; email: string | null }

const statusColor: Record<RequestStatus, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-violet-100 text-violet-700',
  RESOLVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  DUPLICATE: 'bg-zinc-200 text-zinc-700',
}

export default function RequestDetail({
  request,
  staff,
}: {
  request: RequestRow
  staff: Staff[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [lang, setLang] = useState<Lang>('en')
  const [status, setStatus] = useState<RequestStatus>(request.status)
  const [internalNotes, setInternalNotes] = useState(request.internal_notes)
  const [assignedTo, setAssignedTo] = useState(request.assigned_to ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  function n(o: NamePair | null) {
    return o ? (lang === 'ta' && o.name_ta ? o.name_ta : o.name_en) : '—'
  }

  async function save() {
    setSaving(true)
    setSaved(false)
    setError('')
    const { error: err } = await supabase
      .from('requests')
      .update({
        status,
        internal_notes: internalNotes,
        assigned_to: assignedTo || null,
      })
      .eq('id', request.id)
    setSaving(false)
    if (err) {
      setError(t(lang, 'tryAgain'))
      return
    }
    setSaved(true)
    router.refresh()
  }

  async function downloadAttachment(a: Attachment) {
    const { data } = await supabase.storage
      .from('request-attachments')
      .createSignedUrl(a.file_path, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function remove() {
    if (!window.confirm(t(lang, 'confirmDelete'))) return
    setDeleting(true)
    setError('')
    const paths = request.attachments.map((a) => a.file_path)
    if (paths.length > 0) {
      await supabase.storage.from('request-attachments').remove(paths)
    }
    const { error: err } = await supabase.from('requests').delete().eq('id', request.id)
    setDeleting(false)
    if (err) {
      setError(t(lang, 'tryAgain'))
      return
    }
    router.push('/admin/dashboard')
    router.refresh()
  }

  const waMessage = buildWhatsAppMessage({
    id: request.id,
    request_number: request.request_number,
    name: request.name,
    mobile: request.mobile,
    subject: request.subject,
    status: request.status,
    created_at: request.created_at,
  })

  const rows: [TranslationKey, string][] = [
    ['name', `${request.name}${request.initial ? ` (${request.initial})` : ''}`],
    ['mobile', request.mobile],
    ['alternateMobile', request.alternate_mobile || '—'],
    ['district', n(request.district)],
    ['taluk', n(request.taluk)],
    ['localBody', n(request.local_body)],
    ['ward', n(request.ward)],
    ['assemblyConstituency', n(request.assembly_constituency)],
    ['parliamentConstituency', n(request.parliament_constituency)],
    ['address', request.address || '—'],
    ['category', n(request.category)],
    ['createdAt', new Date(request.created_at).toLocaleString()],
    ['updatedAt', new Date(request.updated_at).toLocaleString()],
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/admin/dashboard" className="text-sm text-blue-600 hover:underline">
          ← {t(lang, 'backToDashboard')}
        </Link>
        <div className="lang-switch">
          {(['en', 'ta'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={lang === l ? 'active' : ''}
            >
              {l === 'en' ? 'English' : 'தமிழ்'}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">{request.request_number}</h1>
            <p className="text-sm text-zinc-500">{request.subject}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[status]}`}>
            {STATUS_LABELS[status][lang]}
          </span>
        </div>

        <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-2 text-sm">
              <dt className="w-40 shrink-0 text-zinc-500">{t(lang, k)}</dt>
              <dd className="text-zinc-800">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {request.attachments.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-zinc-900">{t(lang, 'attachments')}</h2>
          <ul className="mt-2 flex flex-col gap-1">
            {request.attachments.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span className="truncate text-zinc-700">{a.file_name}</span>
                <button
                  onClick={() => downloadAttachment(a)}
                  className="ml-3 shrink-0 rounded bg-zinc-100 px-2 py-1 text-xs font-medium hover:bg-zinc-200"
                >
                  {t(lang, 'download')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-semibold text-zinc-900">{t(lang, 'manage')}</h2>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
            {t(lang, 'status')}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RequestStatus)}
              className="field-input"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s][lang]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
            {t(lang, 'assignedTo')}
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="field-input"
            >
              <option value="">{t(lang, 'unassigned')}</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.email}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
            {t(lang, 'internalNotes')}{' '}
            <span className="text-xs font-normal text-zinc-500">{t(lang, 'internalNotesHint')}</span>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={4}
              className="field-input"
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? t(lang, 'saving') : t(lang, 'saveChanges')}
            </button>
            {saved && <span className="text-sm text-green-600">{t(lang, 'saved')}</span>}
            {error && <span className="text-sm text-red-600">{error}</span>}
            <button
              onClick={remove}
              disabled={deleting}
              className="btn btn-secondary text-red-600 hover:bg-red-50"
            >
              {deleting ? t(lang, 'deleting') : t(lang, 'deleteRequest')}
            </button>
            <a
              href={whatsAppDeepLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success ml-auto"
            >
              {t(lang, 'sendViaWhatsApp')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
