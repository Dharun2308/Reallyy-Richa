'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CheckCircle, Play } from 'lucide-react'

interface Props {
  protocolId: string
  isActive: boolean
  userId?: string
}

export default function StartProtocolButton({ protocolId, isActive, userId }: Props) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleStart = async () => {
    if (!userId) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    if (active) return
    setLoading(true)
    const supabase = createClient()
    try {
      await supabase
        .from('user_protocols')
        .insert({ user_id: userId, protocol_id: protocolId })
      setActive(true)
      toast({ title: 'Protocol started!', description: 'Track your progress in Dashboard.', variant: 'success' as never })
    } catch {
      toast({ title: 'Error', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleStart}
      disabled={loading || active}
      className="w-full"
      variant={active ? 'secondary' : 'default'}
    >
      {active ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4" /> In Progress
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4" /> {loading ? 'Starting…' : "I'm Doing This!"}
        </>
      )}
    </Button>
  )
}
