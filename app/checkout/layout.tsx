import { notFound } from 'next/navigation'
import { SHOP_ENABLED } from '@/lib/features'

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!SHOP_ENABLED) notFound();
  return children;
}
