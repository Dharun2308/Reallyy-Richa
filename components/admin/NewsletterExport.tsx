'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { NewsletterSubscriber } from '@/types/database'

interface Props {
  subscribers: NewsletterSubscriber[]
}

export default function NewsletterExport({ subscribers }: Props) {
  const exportCSV = () => {
    const csv = ['email,subscribed_at', ...subscribers.map(s => `${s.email},${s.subscribed_at}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="sm" onClick={exportCSV} disabled={subscribers.length === 0}>
      <Download className="h-4 w-4 mr-2" /> Export CSV
    </Button>
  )
}
