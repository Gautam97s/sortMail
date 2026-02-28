/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },

    // Image domains for avatars
    images: {
        domains: ["lh3.googleusercontent.com", "graph.microsoft.com", "www.gstatic.com"],
    },

    // Performance Optimizations
    experimental: {
        optimizePackageImports: [
            "lucide-react",
            "@radix-ui/react-avatar",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
        ],
    },

    // Use SWC for minification (default in newer Next.js but good to be explicit)
    swcMinify: true,

    // Transpile GSAP for better performance
    transpilePackages: ['gsap'],
};

module.exports = nextConfig;
