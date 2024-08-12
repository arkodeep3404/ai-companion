/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1ppppl30oeslu.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
