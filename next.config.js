/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Alternatif olarak spesifik domainler:
    // domains: [
    //   'res.cloudinary.com',
    //   'images.unsplash.com',
    //   // Supabase storage domain'iniz varsa ekleyin
    // ],
  },
};

module.exports = nextConfig;
