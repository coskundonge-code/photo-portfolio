import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SHOP_ENABLED } from '@/lib/features'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Limited edition fine art prints by Coşkun Dönge. Museum-quality framed photography available in multiple sizes.',
  openGraph: {
    title: 'Shop | Coşkun Dönge Photography',
    description: 'Limited edition fine art prints by Coşkun Dönge. Museum-quality framed photography available in multiple sizes.',
  },
  alternates: {
    canonical: 'https://www.coskundonge.com/shop',
  },
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!SHOP_ENABLED) notFound();
  return children;
}
