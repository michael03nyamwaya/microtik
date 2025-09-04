// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MIKROTIK_HOST: process.env.MIKROTIK_HOST,
    MIKROTIK_USER: process.env.MIKROTIK_USER,
    MIKROTIK_PASS: process.env.MIKROTIK_PASS,
    MIKROTIK_PORT: process.env.MIKROTIK_PORT?.toString(), // Convert to string
  },
}

module.exports = nextConfig