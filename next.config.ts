import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: `/${process.env.CLOUDINARY_CLOUD_NAME}/**`, // Replace 'your-cloud-name' with your Cloudinary cloud name
      },
    ],
  },
  /* if we want browser caching , it is now uncached bydefault in nextjs 15 unlike nextjs 14*/
  // experimental:{
  //   staleTimes:{
  //     dynamic:30,
  //   }
  // }
};

export default nextConfig;
