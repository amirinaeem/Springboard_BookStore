//==============================================================
// FILE: next.config.mjs
// DESCRIPTION: Next.js configuration (images/perf tweaks allowed).
//==============================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Book covers
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "https", hostname: "books.google.com" },
      { protocol: "https", hostname: "books.googleusercontent.com" },

      // GitHub avatars
      { protocol: "https", hostname: "avatars.githubusercontent.com" },

      // Google profile images
      { protocol: "https", hostname: "lh3.googleusercontent.com" },

      // Gravatar (used as fallback by some providers)
      { protocol: "https", hostname: "www.gravatar.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
    ],
  },
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
};

export default nextConfig;
