'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

interface Props {
  value: string
  onChange: (url: string) => void
  bucket?: string
  folder?: string
  label?: string
}

export default function ImageUploader({
  value,
  onChange,
  bucket = 'images',
  folder = 'uploads',
  label = 'Cover Image',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const upload = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'JPEG, PNG, WebP or AVIF only.', variant: 'destructive' })
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast({ title: 'File too large', description: 'Max 5MB.', variant: 'destructive' })
      return
    }

    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}.${ext}`

    const { error, data } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' })
    } else {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
      onChange(urlData.publicUrl)
      toast({ title: 'Image uploaded!', variant: 'success' as never })
    }
    setUploading(false)
  }

  const handleFile = (file: File | undefined) => {
    if (file) upload(file)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-charcoal mb-1.5">{label}</label>

      {value ? (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-cream-200">
          <Image src={value} alt="Uploaded image" fill className="object-cover" sizes="600px" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 text-charcoal hover:bg-white transition-colors"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={cn(
            'flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
            dragOver ? 'border-sage bg-sage-50' : 'border-cream-300 hover:border-sage hover:bg-cream-50',
            uploading && 'pointer-events-none opacity-60'
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          role="button"
          tabIndex={0}
          aria-label="Upload image"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-sage animate-spin" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-charcoal-muted mb-2" />
              <p className="text-sm text-charcoal-muted">
                <span className="text-sage font-medium">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-charcoal-muted mt-1">JPEG, PNG, WebP — max 5MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Or paste URL */}
      {!value && (
        <div className="mt-2">
          <input
            type="url"
            placeholder="Or paste an image URL…"
            className="w-full text-sm border border-cream-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sage text-charcoal"
            onBlur={(e) => { if (e.target.value) onChange(e.target.value) }}
          />
        </div>
      )}
    </div>
  )
}
