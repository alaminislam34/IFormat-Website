import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://iformat.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/dashboard/billing/success*",
          "/dashboard/billing/cancel*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
