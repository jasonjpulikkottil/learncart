/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google Auth images
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub Auth images
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'www.paypalobjects.com'
      }
    ],
  },
};

export default nextConfig;
