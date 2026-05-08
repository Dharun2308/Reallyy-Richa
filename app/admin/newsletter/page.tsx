import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { BRAND_NAME } from '@/lib/config'
import NewsletterExport from '@/components/admin/NewsletterExport'

export const metadata: Metadata = { title: `Newsletter — Admin — ${BRAND_NAME}` }

export default async function AdminNewsletterPage() {
  const supabase = await createClient()
  const { data: subscribers, count } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact' })
    .order('subscribed_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-charcoal">Newsletter Subscribers</h1>
          <p className="text-charcoal-muted text-sm mt-1">{count ?? 0} total subscribers</p>
        </div>
        <NewsletterExport subscribers={subscribers ?? []} />
      </div>

      <div className="bg-white rounded-xl border border-cream-200 overflow-hidden">
        {subscribers && subscribers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-charcoal-muted font-medium">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-cream-50">
                    <td className="px-4 py-3 text-charcoal">{sub.email}</td>
                    <td className="px-4 py-3 text-charcoal-muted text-xs">
                      {new Date(sub.subscribed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-charcoal-muted">No subscribers yet.</div>
        )}
      </div>
    </div>
  )
}
