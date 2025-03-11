/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['cdn.myanimelist.net', 'img1.ak.crunchyroll.com', 'img.youtube.com', 'samehadaku.mba'],
      },

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Tambahkan ini untuk mengabaikan ESLint errors juga
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

module.exports = nextConfig;
