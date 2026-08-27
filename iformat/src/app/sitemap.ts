import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://iformat.com";
  const lastModified = new Date();

  // Public searchable routes
  const routes = [
    "",
    "/job-portal",
    "/job-assistant",
    "/services",
    "/about",
    "/login",
    "/signup",
    "/account-type",
    "/dashboard/billing",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" || route === "/job-portal" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/job-portal" ? 0.9 : 0.7,
  }));
}
