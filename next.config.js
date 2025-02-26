import createNextIntlPlugin from "next-intl/plugin";

const locales = ["en", "es", "fr", "de"];
const defaultLocale = "en";

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
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

const withNextIntl = createNextIntlPlugin({
  locales,
  defaultLocale,
});

export default withNextIntl(nextConfig);
