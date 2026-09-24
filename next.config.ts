import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "es-toolkit",
      "recharts",
      "framer-motion",
    ],
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.localhost:3000',
        '*.vercel.app',
        ...(process.env.NEXT_PUBLIC_ROOT_DOMAIN ? [
          process.env.NEXT_PUBLIC_ROOT_DOMAIN.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim(),
          `*.${process.env.NEXT_PUBLIC_ROOT_DOMAIN.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim().split(':')[0]}`
        ] : [])
      ],
      bodySizeLimit: '25mb'
    }
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif|woff2|woff|ttf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
