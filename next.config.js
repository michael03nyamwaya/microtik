/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DARAJA_CONSUMER_KEY: process.env.DARAJA_CONSUMER_KEY,
    DARAJA_CONSUMER_SECRET: process.env.DARAJA_CONSUMER_SECRET,
    DARAJA_BUSINESS_SHORTCODE: process.env.DARAJA_BUSINESS_SHORTCODE,
    DARAJA_PASSKEY: process.env.DARAJA_PASSKEY,
    BASE_URL: process.env.BASE_URL,
    MIKROTIK_HOST: process.env.MIKROTIK_HOST,
    MIKROTIK_USER: process.env.MIKROTIK_USER,
    MIKROTIK_PASSWORD: process.env.MIKROTIK_PASSWORD,
    MIKROTIK_PORT: process.env.MIKROTIK_PORT || 8728
  }
}

module.exports = nextConfig