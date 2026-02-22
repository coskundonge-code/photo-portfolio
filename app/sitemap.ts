import { MetadataRoute } from 'next'
import { getProducts, getProjects } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.coskundonge.com'

  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Dinamik ürün sayfaları
  let productPages: MetadataRoute.Sitemap = []
  try {
    const products = await getProducts()
    productPages = products.map((product) => ({
      url: `${baseUrl}/shop/${product.id}`,
      lastModified: new Date(product.updated_at || product.created_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // Supabase hata verirse statik sayfalarla devam et
  }

  return [...staticPages, ...productPages]
}
