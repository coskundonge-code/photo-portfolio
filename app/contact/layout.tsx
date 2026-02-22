import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Coşkun Dönge for photography inquiries, print orders, and collaborations.',
  openGraph: {
    title: 'Contact | Coşkun Dönge Photography',
    description: 'Get in touch with Coşkun Dönge for photography inquiries, print orders, and collaborations.',
  },
  alternates: {
    canonical: 'https://www.coskundonge.com/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
