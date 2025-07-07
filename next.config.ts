import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['szzglzcddjrnrtguwjsc.supabase.co'], // Replace with your actual Supabase storage domain
  },
}

export default nextConfig