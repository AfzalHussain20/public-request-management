'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { t, type Lang, type TranslationKey } from '@/lib/i18n'
import { validateRequestForm } from '@/lib/validation'
import {
  downloadReceipt,
  whatsAppDeepLink,
  buildWhatsAppMessage,
  type SubmittedRequest,
} from '@/lib/receipt'

type Option = { id: string; name_en: string; name_ta: string }

type FormState = {
  name: string
  initial: string
  mobile: string
  alternate_mobile: string
  district_id: string
  taluk_id: string
  local_body_type_id: string
  local_body_id: string
  ward_id: string
  assembly_constituency_id: string
  parliament_constituency_id: string
  address: string
  category_id: string
  subject: string
  description: string
  consent: boolean
  company: string
}

const emptyForm: FormState = {
  name: '',
  initial: '',
  mobile: '',
  alternate_mobile: '',
  district_id: '',
  taluk_id: '',
  local_body_type_id: '',
  local_body_id: '',
  ward_id: '',
  assembly_constituency_id: '',
  parliament_constituency_id: '',
  address: '',
  category_id: '',
  subject: '',
  description: '',
  consent: false,
  company: '',
}

export default function PublicForm() {
  const supabase = createClient()
  const [lang, setLang] = useState<Lang>('ta')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [districts, setDistricts] = useState<Option[]>([])
  const [taluks, setTaluks] = useState<Option[]>([])
  const [bodyTypes, setBodyTypes] = useState<Option[]>([])
  const [localBodies, setLocalBodies] = useState<Option[]>([])
  const [wards, setWards] = useState<Option[]>([])
  const [assemblyConstituencies, setAssemblyConstituencies] = useState<Option[]>([])
  const [categories, setCategories] = useState<Option[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState<SubmittedRequest | null>(null)
  const [copied, setCopied] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [parliamentName, setParliamentName] = useState('')

  function nameOf(o: Option | undefined) {
    if (!o) return ''
    return lang === 'ta' && o.name_ta ? o.name_ta : o.name_en
  }

  useEffect(() => {
    ;(async () => {
      const [d, bt, c, ac] = await Promise.all([
        supabase.from('districts').select('id,name_en,name_ta').order('name_en'),
        supabase.from('local_body_types').select('id,name_en,name_ta').order('name_en'),
        supabase.from('categories').select('id,name_en,name_ta').order('name_en'),
        supabase
          .from('assembly_constituencies')
          .select('id,name_en,name_ta')
          .order('name_en'),
      ])
      if (!d.error) setDistricts(d.data as Option[])
      if (!bt.error) setBodyTypes(bt.data as Option[])
      if (!c.error) setCategories(c.data as Option[])
      if (!ac.error) setAssemblyConstituencies(ac.data as Option[])
    })()
  }, [supabase])

  useEffect(() => {
    if (!form.district_id) return setTaluks([])
    supabase
      .from('taluks')
      .select('id,name_en,name_ta')
      .eq('district_id', form.district_id)
      .order('name_en')
      .then(({ data }) => setTaluks((data as Option[]) ?? []))
  }, [form.district_id, supabase])

  useEffect(() => {
    if (!form.district_id || !form.local_body_type_id) return setLocalBodies([])
    supabase
      .from('local_bodies')
      .select('id,name_en,name_ta')
      .eq('district_id', form.district_id)
      .eq('local_body_type_id', form.local_body_type_id)
      .order('name_en')
      .then(({ data }) => setLocalBodies((data as Option[]) ?? []))
  }, [form.district_id, form.local_body_type_id, supabase])

  useEffect(() => {
    if (!form.local_body_id) return setWards([])
    supabase
      .from('wards')
      .select('id,name_en,name_ta')
      .eq('local_body_id', form.local_body_id)
      .order('name_en')
      .then(({ data }) => setWards((data as Option[]) ?? []))
  }, [form.local_body_id, supabase])

  useEffect(() => {
    if (!form.assembly_constituency_id) {
      setForm((f) => ({ ...f, parliament_constituency_id: '' }))
      setParliamentName('')
      return
    }
    supabase
      .from('assembly_parliament_mapping')
      .select('parliament_constituencies(id,name_en,name_ta)')
      .eq('assembly_constituency_id', form.assembly_constituency_id)
      .maybeSingle()
      .then(({ data }) => {
        const pc = (data as { parliament_constituencies: Option } | null)?.parliament_constituencies
        setForm((f) => ({ ...f, parliament_constituency_id: pc?.id ?? '' }))
        setParliamentName(pc ? (lang === 'ta' && pc.name_ta ? pc.name_ta : pc.name_en) : '')
      })
  }, [form.assembly_constituency_id, supabase, lang])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
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
  }

  function field(key: string, labelKey: TranslationKey, required = false) {
    const value = form[key as keyof FormState] as string
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-800">
          {t(lang, labelKey)}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        <input
          value={value}
          onChange={(e) => set(key as keyof FormState, e.target.value)}
          className="field-input"
        />
        {errors[key] && (
          <p className="text-xs text-red-600">{t(lang, errors[key] as TranslationKey)}</p>
        )}
      </div>
    )
  }

  function select(
    key: keyof FormState,
    options: Option[],
    labelKey: TranslationKey,
    placeholderKey: TranslationKey = 'selectOption'
  ) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-800">{t(lang, labelKey)}</label>
        <select
          value={form[key] as string}
          onChange={(e) => set(key, e.target.value)}
          className="field-input"
        >
          <option value="">{t(lang, placeholderKey)}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {nameOf(o)}
            </option>
          ))}
        </select>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setFormError('')
    if (attachment && !/^image\/(jpeg|png)$|^application\/pdf$/.test(attachment.type)) {
      setFormError(t(lang, 'tryAgain'))
      return
    }
    if (attachment && attachment.size > 5 * 1024 * 1024) {
      setFormError(t(lang, 'tryAgain'))
      return
    }

    const validation = validateRequestForm({
      name: form.name,
      initial: form.initial,
      mobile: form.mobile,
      alternate_mobile: form.alternate_mobile,
      district_id: form.district_id || null,
      taluk_id: form.taluk_id || null,
      local_body_id: form.local_body_id || null,
      ward_id: form.ward_id || null,
      assembly_constituency_id: form.assembly_constituency_id || null,
      parliament_constituency_id: form.parliament_constituency_id || null,
      address: form.address,
      category_id: form.category_id || null,
      subject: form.subject,
      description: form.description,
      consent: form.consent,
      company: form.company,
    })
    if (!validation.ok) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)
    const body = new FormData()
    Object.entries(form).forEach(([k, v]) => body.append(k, String(v)))
    if (attachment) body.append('attachment', attachment)

    try {
      const res = await fetch('/api/requests', { method: 'POST', body })
      const data = await res.json()
      if (res.ok && data.ok) {
        setSubmitted(data.request as SubmittedRequest)
      } else if (res.status === 429) {
        setFormError(t(lang, 'tryAgain'))
      } else if (data.errors) {
        setErrors(data.errors)
      } else {
        setFormError(t(lang, 'tryAgain'))
      }
    } catch {
      setFormError(t(lang, 'tryAgain'))
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    const waMessage = buildWhatsAppMessage(submitted)
    return (
      <div className="card flex flex-col items-center gap-4 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">✓</div>
        <h1 className="text-xl font-semibold">{t(lang, 'success.title')}</h1>
        <p className="text-zinc-600">{t(lang, 'success.message')}</p>
        <p className="text-2xl font-bold tracking-wide text-blue-700">{submitted.request_number}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(submitted.request_number)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
            className="btn btn-secondary"
          >
            {copied ? t(lang, 'copied') : t(lang, 'copyId')}
          </button>
          <button onClick={() => downloadReceipt(submitted, lang)} className="btn btn-secondary">
            {t(lang, 'downloadReceipt')}
          </button>
          <a
            href={whatsAppDeepLink(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success"
          >
            {t(lang, 'sendWhatsApp')}
          </a>
          <button
            onClick={() => {
              setSubmitted(null)
              setForm(emptyForm)
              setAttachment(null)
            }}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            {t(lang, 'newRequest')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <header className="mb-6 flex flex-col items-center gap-2 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          {t(lang, 'publicFormTitle')}
        </h1>
        <p className="text-sm text-zinc-600">{t(lang, 'publicFormSubtitle')}</p>
        <div className="lang-switch mt-1">
          {(['ta', 'en'] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={lang === l ? 'active' : ''}
            >
              {l === 'ta' ? 'தமிழ்' : 'English'}
            </button>
          ))}
        </div>
      </header>

      <input
        type="text"
        name="company"
        value={form.company}
        onChange={(e) => set('company', e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <section className="card p-5">
        <h2 className="section-title mb-4">{t(lang, 'section.personal')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('name', 'name', true)}
          {field('initial', 'initial')}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field('mobile', 'mobile', true)}
          {field('alternate_mobile', 'alternateMobile')}
        </div>
      </section>

      <section className="card mt-4 p-5">
        <h2 className="section-title mb-4">{t(lang, 'section.location')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {select('district_id', districts, 'district')}
          {select('taluk_id', taluks, 'taluk')}
          {select('local_body_type_id', bodyTypes, 'localBodyType')}
          {select('local_body_id', localBodies, 'localBody')}
          {select('ward_id', wards, 'ward')}
          {select('assembly_constituency_id', assemblyConstituencies, 'assemblyConstituency')}
        </div>
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-800">
            {t(lang, 'parliamentConstituency')}
          </label>
          <div className="field-input bg-zinc-50 text-zinc-600">
            {parliamentName || t(lang, 'selectOption')}
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-800">{t(lang, 'address')}</label>
          <textarea
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            rows={3}
            className="field-input"
          />
        </div>
      </section>

      <section className="card mt-4 p-5">
        <h2 className="section-title mb-4">{t(lang, 'section.request')}</h2>
        <div className="flex flex-col gap-4">
          {select('category_id', categories, 'requestCategory')}
          {field('subject', 'subject', true)}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-800">{t(lang, 'description')}</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              className="field-input"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-800">{t(lang, 'attachment')}</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
              className="text-sm text-zinc-600 file:mr-2 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700"
            />
          </div>
        </div>
      </section>

      <section className="card mt-4 p-5">
        <label className="flex items-start gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set('consent', e.target.checked)}
            className="mt-0.5"
          />
          {t(lang, 'consent')}
        </label>
        {errors.consent && <p className="mt-1 text-xs text-red-600">{t(lang, 'pleaseConsent')}</p>}
      </section>

      {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}

      <button type="submit" disabled={loading} className="btn btn-primary mt-6 w-full py-3 text-base">
        {loading ? t(lang, 'submitting') : t(lang, 'submit')}
      </button>
    </form>
  )
}
