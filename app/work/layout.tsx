import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Photography portfolio by Coşkun Dönge. Explore collections across portrait, landscape, street, and documentary photography.',
  openGraph: {
    title: 'Work | Coşkun Dönge Photography',
    description: 'Photography portfolio by Coşkun Dönge. Explore collections across portrait, landscape, street, and documentary photography.',
  },
  alternates: {
    canonical: 'https://www.coskundonge.com/work',
  },
}

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
