/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allows any domain name secure connection (e.g., unsplash, imgur, pinimg, etc.)
        port: '',
        pathname: '/**', // Allows any sub-directory folder path structure
      },
      {
        protocol: 'http',
        hostname: '**', // Also allows unsecured legacy URLs if any exist in your database records
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;