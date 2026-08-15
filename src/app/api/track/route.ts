import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { RequestStatus } from '@/lib/types'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestNumber = String(searchParams.get('request_number') ?? '').trim()
  const mobile = String(searchParams.get('mobile') ?? '').trim()

  if (!requestNumber || !mobile) {
    return NextResponse.json({ error: 'missing' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('requests')
    .select('id, request_number, status, subject, description, category_id, created_at, updated_at')
    .eq('request_number', requestNumber)
    .eq('mobile', mobile)
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  let category: { name_en: string; name_ta: string } | null = null
  if (data.category_id) {
    const { data: cat } = await supabase
      .from('categories')
      .select('name_en, name_ta')
      .eq('id', data.category_id)
      .maybeSingle()
    category = (cat as { name_en: string; name_ta: string } | null) ?? null
  }

  return NextResponse.json({
    ok: true,
    request: {
      request_number: data.request_number,
      status: data.status as RequestStatus,
      subject: data.subject,
      description: data.description,
      category,
      created_at: data.created_at,
      updated_at: data.updated_at,
    },
  })
}
