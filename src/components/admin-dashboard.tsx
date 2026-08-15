'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { t, ALL_STATUSES, STATUS_LABELS, type Lang, type TranslationKey } from '@/lib/i18n'
import type { RequestStatus } from '@/lib/types'
import { downloadReceipt, whatsAppDeepLink, buildWhatsAppMessage } from '@/lib/receipt'
import { exportExcel, exportCsv, type ExportRow } from '@/lib/export'
import QrCode from '@/components/qr-code'

type Option = { id: string; name_en: string; name_ta: string }

type ListRow = {
  id: string
  request_number: string
  name: string
  mobile: string
  status: RequestStatus
  created_at: string
  subject: string
  district: { name_en: string; name_ta: string } | null
  category: { name_en: string; name_ta: string } | null
}

type Filters = {
  search: string
  status: string
  district_id: string
  taluk_id: string
  local_body_type_id: string
  local_body_id: string
  ward_id: string
  assembly_constituency_id: string
  parliament_constituency_id: string
  category_id: string
  from: string
  to: string
}

const emptyFilters: Filters = {
  search: '',
  status: '',
  district_id: '',
  taluk_id: '',
  local_body_type_id: '',
  local_body_id: '',
  ward_id: '',
  assembly_constituency_id: '',
  parliament_constituency_id: '',
  category_id: '',
  from: '',
  to: '',
}

const PAGE_SIZE = 25

const statusColor: Record<RequestStatus, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-violet-100 text-violet-700',
  RESOLVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  DUPLICATE: 'bg-zinc-200 text-zinc-700',
}

type FilterOp = { m: 'eq' | 'or' | 'gte' | 'lt'; k: string; v: string }

function filterOps(f: Filters): FilterOp[] {
  const ops: FilterOp[] = []
  if (f.search) {
    const s = `%${f.search.trim()}%`
    ops.push({ m: 'or', k: '', v: `request_number.ilike.${s},name.ilike.${s},mobile.ilike.${s}` })
  }
  if (f.status) ops.push({ m: 'eq', k: 'status', v: f.status })
  if (f.district_id) ops.push({ m: 'eq', k: 'district_id', v: f.district_id })
  if (f.taluk_id) ops.push({ m: 'eq', k: 'taluk_id', v: f.taluk_id })
  if (f.local_body_id) ops.push({ m: 'eq', k: 'local_body_id', v: f.local_body_id })
  if (f.ward_id) ops.push({ m: 'eq', k: 'ward_id', v: f.ward_id })
  if (f.assembly_constituency_id) ops.push({ m: 'eq', k: 'assembly_constituency_id', v: f.assembly_constituency_id })
  if (f.parliament_constituency_id) ops.push({ m: 'eq', k: 'parliament_constituency_id', v: f.parliament_constituency_id })
  if (f.category_id) ops.push({ m: 'eq', k: 'category_id', v: f.category_id })
  if (f.from) ops.push({ m: 'gte', k: 'created_at', v: new Date(f.from).toISOString() })
  if (f.to) ops.push({ m: 'lt', k: 'created_at', v: new Date(new Date(f.to).getTime() + 86400000).toISOString() })
  return ops
}

function applyOps<T>(
  q: T,
  ops: FilterOp[],
  b: (q: T, m: FilterOp['m'], k: string, v: string) => T
): T {
  return ops.reduce((acc, op) => b(acc, op.m, op.k, op.v), q)
}

export default function AdminDashboard() {
  const supabase = createClient()
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [lang, setLang] = useState<Lang>('en')
  const [rows, setRows] = useState<ListRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [districts, setDistricts] = useState<Option[]>([])
  const [taluks, setTaluks] = useState<Option[]>([])
  const [bodyTypes, setBodyTypes] = useState<Option[]>([])
  const [localBodies, setLocalBodies] = useState<Option[]>([])
  const [wards, setWards] = useState<Option[]>([])
  const [acs, setAcs] = useState<Option[]>([])
  const [pcs, setPcs] = useState<Option[]>([])
  const [categories, setCategories] = useState<Option[]>([])
  const [exporting, setExporting] = useState(false)
  const [showQr, setShowQr] = useState(false)

  const nameOf = useCallback(
    (o: { name_en: string; name_ta: string } | null | undefined) =>
      o ? (lang === 'ta' && o.name_ta ? o.name_ta : o.name_en) : '—',
    [lang]
  )

  useEffect(() => {
    ;(async () => {
      const [d, bt, c, ac, pc] = await Promise.all([
        supabase.from('districts').select('id,name_en,name_ta').order('name_en'),
        supabase.from('local_body_types').select('id,name_en,name_ta').order('name_en'),
        supabase.from('categories').select('id,name_en,name_ta').order('name_en'),
        supabase.from('assembly_constituencies').select('id,name_en,name_ta').order('name_en'),
        supabase.from('parliament_constituencies').select('id,name_en,name_ta').order('name_en'),
      ])
      if (!d.error) setDistricts(d.data as Option[])
      if (!bt.error) setBodyTypes(bt.data as Option[])
      if (!c.error) setCategories(c.data as Option[])
      if (!ac.error) setAcs(ac.data as Option[])
      if (!pc.error) setPcs(pc.data as Option[])
    })()
  }, [supabase])

  useEffect(() => {
    if (filters.district_id)
      supabase
        .from('taluks')
        .select('id,name_en,name_ta')
        .eq('district_id', filters.district_id)
        .order('name_en')
        .then(({ data }) => setTaluks((data as Option[]) ?? []))
  }, [filters.district_id, supabase])

  useEffect(() => {
    if (filters.district_id && filters.local_body_type_id)
      supabase
        .from('local_bodies')
        .select('id,name_en,name_ta')
        .eq('district_id', filters.district_id)
        .eq('local_body_type_id', filters.local_body_type_id)
        .order('name_en')
        .then(({ data }) => setLocalBodies((data as Option[]) ?? []))
  }, [filters.district_id, filters.local_body_type_id, supabase])

  useEffect(() => {
    if (filters.local_body_id)
      supabase
        .from('wards')
        .select('id,name_en,name_ta')
        .eq('local_body_id', filters.local_body_id)
        .order('name_en')
        .then(({ data }) => setWards((data as Option[]) ?? []))
  }, [filters.local_body_id, supabase])

  const buildQuery = useCallback(() => {
    let q = supabase
      .from('requests')
      .select(
        'id, request_number, name, mobile, status, created_at, subject, district:districts(name_en,name_ta), category:categories(name_en,name_ta)',
        { count: 'exact' }
      )
    q = applyOps(q, filterOps(filters), (qq, m, k, v) => {
      if (m === 'or') return qq.or(v)
      if (m === 'eq') return qq.eq(k, v)
      if (m === 'gte') return qq.gte(k, v)
      return qq.lt(k, v)
    })
    return q.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1).order('created_at', { ascending: false })
  }, [supabase, filters, page])

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data, count }, statsRes] = await Promise.all([
      buildQuery(),
      Promise.all(
        [...ALL_STATUSES, 'ALL'].map(async (s) => {
          let q = supabase.from('requests').select('id', { count: 'exact', head: true })
          if (s !== 'ALL') q = q.eq('status', s as RequestStatus)
          const { count } = await q
          return [s, count ?? 0] as const
        })
      ),
    ])
    setRows((data as unknown as ListRow[]) ?? [])
    setTotal(count ?? 0)
    setStats(Object.fromEntries(statsRes))
    setLoading(false)
  }, [buildQuery, supabase])

  useEffect(() => {
    const timer = setTimeout(() => load(), 150)
    return () => clearTimeout(timer)
  }, [load])

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    if (key === 'district_id' && value !== filters.district_id) {
      setTaluks([])
      setLocalBodies([])
      setWards([])
    }
    if (key === 'local_body_type_id' && value !== filters.local_body_type_id) {
      setLocalBodies([])
      setWards([])
    }
    if (key === 'local_body_id' && value !== filters.local_body_id) {
      setWards([])
    }
    setFilters((f) => {
      const next = { ...f, [key]: value }
      if (key === 'district_id') {
        next.taluk_id = ''
        next.local_body_id = ''
        next.ward_id = ''
      }
      if (key === 'local_body_type_id') {
        next.local_body_id = ''
        next.ward_id = ''
      }
      if (key === 'local_body_id') next.ward_id = ''
      return next
    })
    setPage(0)
  }

  const statCards = useMemo(
    () => [
      { key: 'ALL', labelKey: 'dashboard.total' as TranslationKey },
      { key: 'NEW', labelKey: 'dashboard.new' as TranslationKey },
      { key: 'UNDER_REVIEW', labelKey: 'dashboard.underReview' as TranslationKey },
      { key: 'IN_PROGRESS', labelKey: 'dashboard.inProgress' as TranslationKey },
      { key: 'RESOLVED', labelKey: 'dashboard.resolved' as TranslationKey },
    ],
    []
  )

  async function handleExport(type: 'xlsx' | 'csv') {
    setExporting(true)
    let q = supabase.from('requests').select(
      'request_number, name, initial, mobile, district:districts(name_en,name_ta), taluk:taluks(name_en,name_ta), local_body:local_bodies(name_en,name_ta), ward:wards(name_en,name_ta), assembly_constituency:assembly_constituencies(name_en,name_ta), parliament_constituency:parliament_constituencies(name_en,name_ta), address, category:categories(name_en,name_ta), subject, description, status, assignee:profiles(name), created_at, updated_at'
    )
    q = applyOps(q, filterOps(filters), (qq, m, k, v) => {
      if (m === 'or') return qq.or(v)
      if (m === 'eq') return qq.eq(k, v)
      if (m === 'gte') return qq.gte(k, v)
      return qq.lt(k, v)
    })
    const { data, error } = await q.order('created_at', { ascending: false })
    setExporting(false)
    if (error) return
    const rows = data as unknown as ExportRow[]
    const filename = `requests-${new Date().toISOString().slice(0, 10)}`
    if (type === 'xlsx') exportExcel(rows, filename)
    else exportCsv(rows, filename)
  }

  function selectFilter(key: keyof Filters, options: Option[], placeholderKey: TranslationKey) {
    return (
      <select
        value={filters[key] as string}
        onChange={(e) => setFilter(key, e.target.value)}
        className="field-input text-sm"
      >
        <option value="">{t(lang, placeholderKey)}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {nameOf(o)}
          </option>
        ))}
      </select>
    )
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          {t(lang, 'dashboard.title')}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => handleExport('xlsx')} disabled={exporting} className="btn btn-secondary">
            {t(lang, 'exportExcel')}
          </button>
          <button onClick={() => handleExport('csv')} disabled={exporting} className="btn btn-secondary">
            {t(lang, 'exportCsv')}
          </button>
          <button onClick={() => setShowQr((v) => !v)} className="btn btn-secondary">
            {t(lang, 'qr')}
          </button>
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
      </div>

      {showQr && (
        <div className="card flex justify-center p-4">
          <QrCode url={`${process.env.NEXT_PUBLIC_APP_URL || ''}/form`} size={180} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {statCards.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter('status', s.key === 'ALL' ? '' : s.key)}
            className={`card p-3 text-left transition-colors ${
              filters.status === s.key ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <p className="text-2xl font-semibold text-zinc-900">{stats[s.key] ?? 0}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{t(lang, s.labelKey)}</p>
          </button>
        ))}
      </div>

      <div className="card p-4">
        <div className="flex flex-col gap-3">
          <input
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder={t(lang, 'searchPlaceholder')}
            className="field-input"
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {selectFilter('status', ALL_STATUSES.map((s) => ({ id: s, name_en: STATUS_LABELS[s].en, name_ta: STATUS_LABELS[s].ta })), 'status')}
            {selectFilter('district_id', districts, 'district')}
            {selectFilter('taluk_id', taluks, 'taluk')}
            {selectFilter('local_body_type_id', bodyTypes, 'localBodyType')}
            {selectFilter('local_body_id', localBodies, 'localBody')}
            {selectFilter('ward_id', wards, 'ward')}
            {selectFilter('assembly_constituency_id', acs, 'assemblyConstituency')}
            {selectFilter('parliament_constituency_id', pcs, 'parliamentConstituency')}
            {selectFilter('category_id', categories, 'category')}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilter('from', e.target.value)}
              className="field-input w-auto"
              aria-label={t(lang, 'from')}
            />
            <span className="text-sm text-zinc-500">{t(lang, 'to')}</span>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilter('to', e.target.value)}
              className="field-input w-auto"
              aria-label={t(lang, 'to')}
            />
            <button
              onClick={() => {
                setFilters(emptyFilters)
                setPage(0)
              }}
              className="btn btn-secondary"
            >
              {t(lang, 'clear')}
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">{t(lang, 'requestId')}</th>
              <th className="px-4 py-3">{t(lang, 'name')}</th>
              <th className="px-4 py-3">{t(lang, 'mobile')}</th>
              <th className="px-4 py-3">{t(lang, 'district')}</th>
              <th className="px-4 py-3">{t(lang, 'category')}</th>
              <th className="px-4 py-3">{t(lang, 'status')}</th>
              <th className="px-4 py-3">{t(lang, 'createdAt')}</th>
              <th className="px-4 py-3">{t(lang, 'actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                  {t(lang, 'loading')}
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                  {t(lang, 'noResults')}
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((r) => (
                <tr key={r.id} className="border-b border-zinc-100">
                  <td className="px-4 py-3 font-medium text-blue-700">
                    <Link href={`/admin/requests/${r.id}`}>{r.request_number}</Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-800">{r.name}</td>
                  <td className="px-4 py-3 text-zinc-800">{r.mobile}</td>
                  <td className="px-4 py-3 text-zinc-800">{nameOf(r.district)}</td>
                  <td className="px-4 py-3 text-zinc-800">{nameOf(r.category)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[r.status]}`}>
                      {STATUS_LABELS[r.status][lang]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/requests/${r.id}`}
                        className="rounded bg-zinc-100 px-2 py-1 text-xs font-medium hover:bg-zinc-200"
                      >
                        {t(lang, 'view')}
                      </Link>
                      <a
                        href={whatsAppDeepLink(
                          buildWhatsAppMessage({
                            id: r.id,
                            request_number: r.request_number,
                            name: r.name,
                            mobile: r.mobile,
                            subject: r.subject,
                            status: r.status,
                            created_at: r.created_at,
                          })
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 hover:bg-green-200"
                      >
                        {t(lang, 'whatsApp')}
                      </a>
                      <button
                        onClick={() =>
                          downloadReceipt(
                            {
                              id: r.id,
                              request_number: r.request_number,
                              name: r.name,
                              mobile: r.mobile,
                              subject: r.subject,
                              status: r.status,
                              created_at: r.created_at,
                            },
                            lang
                          )
                        }
                        className="rounded bg-zinc-100 px-2 py-1 text-xs font-medium hover:bg-zinc-200"
                      >
                        {t(lang, 'receipt')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-600">
        <span>
          {total} {t(lang, 'results')} · {t(lang, 'page')} {page + 1} {t(lang, 'of')} {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="btn btn-secondary disabled:opacity-40"
          >
            {t(lang, 'prev')}
          </button>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="btn btn-secondary disabled:opacity-40"
          >
            {t(lang, 'next')}
          </button>
        </div>
      </div>
    </div>
  )
}
