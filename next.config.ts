import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['ajburehyunbvpuhnyjbo.supabase.co'], // ✅ Replace with your actual Supabase project domain if different
  },
}

export default nextConfig
