'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  table: string
  onDeleted?: () => void
}

export default function DeleteButton({ id, table, onDeleted }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Deleted', variant: 'success' as never })
      onDeleted?.()
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 hover:text-red-500 hover:bg-red-50"
      onClick={handleDelete}
      disabled={loading}
      aria-label="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
