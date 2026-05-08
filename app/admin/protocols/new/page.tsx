import type { Metadata } from 'next'
import { BRAND_NAME } from '@/lib/config'
import ProtocolForm from '@/components/admin/ProtocolForm'

export const metadata: Metadata = { title: `New Protocol — Admin — ${BRAND_NAME}` }

export default function NewProtocolPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-playfair text-2xl font-bold text-charcoal">New Protocol</h1>
      <ProtocolForm />
    </div>
  )
}
