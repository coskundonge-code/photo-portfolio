import { Metadata } from 'next'

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
  return children;
}
