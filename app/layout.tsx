import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.coskundonge.com'),
  title: {
    default: 'Coşkun Dönge — Fine Art Photography',
    template: '%s | Coşkun Dönge Photography',
  },
  description: 'Fine art photography by Coşkun Dönge. Limited edition prints, framed artwork, and photography collections. Portrait, landscape, street, and documentary photography.',
  keywords: ['photography', 'fine art', 'limited edition prints', 'Coşkun Dönge', 'fotoğraf', 'sanat fotoğrafı', 'çerçeveli baskı'],
  authors: [{ name: 'Coşkun Dönge' }],
  creator: 'Coşkun Dönge',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    alternateLocale: 'en_US',
    url: 'https://www.coskundonge.com',
    siteName: 'Coşkun Dönge Photography',
    title: 'Coşkun Dönge — Fine Art Photography',
    description: 'Fine art photography by Coşkun Dönge. Limited edition prints, framed artwork, and photography collections.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coşkun Dönge — Fine Art Photography',
    description: 'Fine art photography by Coşkun Dönge. Limited edition prints and framed artwork.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.coskundonge.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Coşkun Dönge Photography',
    url: 'https://www.coskundonge.com',
    description: 'Fine art photography by Coşkun Dönge. Limited edition prints and framed artwork.',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TR',
    },
    sameAs: [
      'https://www.instagram.com/coskundonge',
    ],
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white text-neutral-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
