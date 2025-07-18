import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack:(config) =>{
    config.externals.push({
      "utf-8-validate":"commonjs utf-8-validate",
      bufferutil:"commonjs bufferutil"
    })

    return config;
  },
  eslint: {
    ignoreDuringBuilds: true, 
  },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: `/${process.env.CLOUDINARY_CLOUD_NAME}/**`, // Replace 'your-cloud-name' with your Cloudinary cloud name
      },
    ],
  },
  // async headers(){
  //   return [
  //     {
  //       source: '/api/socket',
  //       headers: [
  //         { key: 'Connection', value: 'Upgrade' },
  //         { key: 'Upgrade', value: 'websocket' },
  //         { key: 'Cache-Control', value: 'no-store' }, // Prevent caching of WebSocket connections
  //       ],
  //     },
  //   ];
  // },
  /* if we want browser caching , it is now uncached bydefault in nextjs 15 unlike nextjs 14*/
  // experimental:{
  //   staleTimes:{
  //     dynamic:30,
  //   }
  // }
};

export default nextConfig;
