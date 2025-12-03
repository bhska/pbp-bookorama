/** @type {import('next').NextConfig} */
const nextConfig = {
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/login',
  //       permanent: false,
  //     },
  //   ];
  // },
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
};

module.exports = nextConfig;
