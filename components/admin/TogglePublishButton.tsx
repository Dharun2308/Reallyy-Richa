'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  table: string
  published: boolean
}

export default function TogglePublishButton({ id, table, published }: Props) {
  const [value, setValue] = useState(published)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from(table)
      .update({ published: !value })
      .eq('id', id)
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    } else {
      setValue(!value)
      toast({ title: !value ? 'Published' : 'Unpublished', variant: 'success' as never })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Switch
      checked={value}
      onCheckedChange={toggle}
      disabled={loading}
      aria-label={value ? 'Unpublish' : 'Publish'}
    />
  )
}
