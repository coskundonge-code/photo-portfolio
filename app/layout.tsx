import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Photography Portfolio',
  description: 'Professional photography portfolio and print shop',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900">
        {children}
      </body>
    </html>
  )
}
