/** @type {import('next').NextConfig} */
const nextConfig = {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors or type errors.
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    // For Railway/Docker deployment, uncomment the line below:
    // output: "standalone",
};

export default nextConfig;
