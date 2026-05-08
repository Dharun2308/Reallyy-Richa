import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter, Lora } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'
import { createClient } from '@/lib/supabase/server'
import { BRAND_NAME, BRAND_DESCRIPTION, SITE_URL } from '@/lib/config'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  style: ['italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_DESCRIPTION,
  keywords: [
    'anti-inflammatory diet',
    'healthy recipes',
    'wellness protocols',
    'whole foods',
    'nutrition',
  ],
  authors: [{ name: 'Richa' }],
  creator: BRAND_NAME,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: BRAND_NAME,
    title: BRAND_NAME,
    description: BRAND_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND_NAME,
    description: BRAND_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#7C9A6E',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let profile = null
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = data
    }
  } catch {
    // Supabase not configured — render layout without user session
  }

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${lora.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-cream">
        <Header user={profile} />
        <main className="flex-1 pt-16 md:pt-20">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
