/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // NOTE: `output: "standalone"` is only needed for the Docker/Render image.
  // On Vercel it must be omitted, or every route 404s. The Dockerfile sets it
  // via the NEXT_OUTPUT env when building the container image instead.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
};

module.exports = nextConfig;
