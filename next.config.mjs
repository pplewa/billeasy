import createNextIntlPlugin from "next-intl/plugin";

const nextConfig = {
  serverExternalPackages: ["mongoose"],
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  output: "standalone",
};

// Use the default location for the request config (i18n/request.ts)
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
