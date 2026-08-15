import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateRequestForm, sanitizeText, isValidFileType, isValidFileSize } from '@/lib/validation'
import { notifyNewRequest } from '@/lib/notify'

export const runtime = 'nodejs'

async function isSpam(mobile: string, supabase: ReturnType<typeof createAdminClient>) {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('requests')
    .select('id', { count: 'exact', head: true })
    .eq('mobile', mobile)
    .gte('created_at', twoMinutesAgo)
  return (count ?? 0) > 0
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const input = {
      name: sanitizeText(String(formData.get('name') ?? ''), 100),
      initial: sanitizeText(String(formData.get('initial') ?? ''), 10),
      mobile: sanitizeText(String(formData.get('mobile') ?? ''), 15),
      alternate_mobile: sanitizeText(String(formData.get('alternate_mobile') ?? ''), 15),
      district_id: (formData.get('district_id') as string) || null,
      taluk_id: (formData.get('taluk_id') as string) || null,
      local_body_id: (formData.get('local_body_id') as string) || null,
      ward_id: (formData.get('ward_id') as string) || null,
      assembly_constituency_id: (formData.get('assembly_constituency_id') as string) || null,
      parliament_constituency_id: (formData.get('parliament_constituency_id') as string) || null,
      address: sanitizeText(String(formData.get('address') ?? ''), 500),
      category_id: (formData.get('category_id') as string) || null,
      subject: sanitizeText(String(formData.get('subject') ?? ''), 200),
      description: sanitizeText(String(formData.get('description') ?? ''), 2000),
      consent: formData.get('consent') === 'true',
      company: String(formData.get('company') ?? ''),
    }

    // Honeypot: bots fill this hidden field.
    if (input.company) {
      return NextResponse.json({ error: 'bad request' }, { status: 400 })
    }

    const result = validateRequestForm(input)
    if (!result.ok) {
      return NextResponse.json({ error: 'validation', errors: result.errors }, { status: 400 })
    }

    const supabase = createAdminClient()

    if (await isSpam(input.mobile, supabase)) {
      return NextResponse.json({ error: 'too_many' }, { status: 429 })
    }

    const file = formData.get('attachment')
    let filePath: string | null = null
    let fileMeta = { file_name: '', file_type: '', file_size: 0 }

    if (file instanceof File && file.size > 0) {
      const type = file.type.toLowerCase()
      if (!isValidFileType(type) || !isValidFileSize(file.size)) {
        return NextResponse.json({ error: 'invalid_file' }, { status: 400 })
      }
    }

    const { data: requestRow, error: insertError } = await supabase
      .from('requests')
      .insert({
        name: input.name,
        initial: input.initial,
        mobile: input.mobile,
        alternate_mobile: input.alternate_mobile || null,
        district_id: input.district_id,
        taluk_id: input.taluk_id,
        local_body_id: input.local_body_id,
        ward_id: input.ward_id,
        assembly_constituency_id: input.assembly_constituency_id,
        parliament_constituency_id: input.parliament_constituency_id,
        address: input.address,
        category_id: input.category_id,
        subject: input.subject,
        description: input.description,
      })
      .select('id, request_number')
      .single()

    if (insertError || !requestRow) {
      console.error('insert error', insertError)
      return NextResponse.json({ error: 'server' }, { status: 500 })
    }

    if (file instanceof File && file.size > 0) {
      const ext = file.name.split('.').pop() ?? ''
      const path = `${requestRow.request_number}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('request-attachments')
        .upload(path, file, { contentType: file.type, upsert: false })

      if (uploadError) {
        console.error('upload error', uploadError)
      } else {
        filePath = path
        fileMeta = {
          file_name: sanitizeText(file.name, 255),
          file_type: file.type,
          file_size: file.size,
        }
        await supabase.from('attachments').insert({
          request_id: requestRow.id,
          file_name: fileMeta.file_name,
          file_path: filePath,
          file_type: fileMeta.file_type,
          file_size: fileMeta.file_size,
        })
      }
    }

    let districtName: string | null = null
    if (input.district_id) {
      const { data: districtRow } = await supabase
        .from('districts')
        .select('name_en')
        .eq('id', input.district_id)
        .maybeSingle()
      districtName = (districtRow as { name_en: string } | null)?.name_en ?? null
    }

    await notifyNewRequest({
      request_number: requestRow.request_number,
      name: input.name,
      mobile: input.mobile,
      subject: input.subject,
      district: districtName,
    })

    return NextResponse.json(
      {
        ok: true,
        request: {
          id: requestRow.id,
          request_number: requestRow.request_number,
          name: input.name,
          mobile: input.mobile,
          subject: input.subject,
          status: 'NEW',
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('request submission error', error)
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}
