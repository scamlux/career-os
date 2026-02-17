import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  async rewrites() {
    return [
      { source: '/api/gateway/:path*', destination: 'http://localhost:8080/:path*' },
      { source: '/api/auth/:path*', destination: 'http://localhost:8081/:path*' },
      { source: '/api/profile/:path*', destination: 'http://localhost:8082/:path*' },
      { source: '/api/ai-core/:path*', destination: 'http://localhost:8083/:path*' },
      { source: '/api/roadmap/:path*', destination: 'http://localhost:8084/:path*' },
      { source: '/api/lms/:path*', destination: 'http://localhost:8085/:path*' },
      { source: '/api/edu-tracker/:path*', destination: 'http://localhost:8086/:path*' },
      { source: '/api/billing/:path*', destination: 'http://localhost:8087/:path*' },
      { source: '/api/analytics/:path*', destination: 'http://localhost:8088/:path*' }
    ];
  }
};

export default nextConfig;
