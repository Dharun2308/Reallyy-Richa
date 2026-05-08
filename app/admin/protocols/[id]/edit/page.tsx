import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BRAND_NAME } from '@/lib/config'
import ProtocolForm from '@/components/admin/ProtocolForm'
import type { Protocol } from '@/types/database'

export const metadata: Metadata = { title: `Edit Protocol — Admin — ${BRAND_NAME}` }

interface Props { params: Promise<{ id: string }> }

export default async function EditProtocolPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const result = await supabase.from('protocols').select('*').eq('id', id).single()
  const protocol = result.data as Protocol | null
  if (!protocol) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-playfair text-2xl font-bold text-charcoal">Edit Protocol</h1>
      <ProtocolForm protocol={protocol} />
    </div>
  )
}
