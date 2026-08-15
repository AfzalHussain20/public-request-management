import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RequestDetail from '@/components/request-detail'

export const metadata: Metadata = { title: 'Request Details' }

export const dynamic = 'force-dynamic'

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: request } = await supabase
    .from('requests')
    .select(
      '*, district:districts(name_en,name_ta), taluk:taluks(name_en,name_ta), local_body:local_bodies(name_en,name_ta), ward:wards(name_en,name_ta), assembly_constituency:assembly_constituencies(name_en,name_ta), parliament_constituency:parliament_constituencies(name_en,name_ta), category:categories(name_en,name_ta), assignee:profiles(name), attachments(*)'
    )
    .eq('id', id)
    .maybeSingle()

  if (!request) notFound()

  const { data: staff } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('role', ['ADMIN', 'STAFF'])
    .order('name')

  return (
    <div className="mx-auto max-w-3xl">
      <RequestDetail request={request} staff={staff ?? []} />
    </div>
  )
}
