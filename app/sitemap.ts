import type { MetadataRoute } from "next";
import { cases } from "@/content/cases";
import { SITE_URL } from "@/lib/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/resume"].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
  const caseRoutes = cases.map((c) => ({ url: `${SITE_URL}/work/${c.slug}` }));
  return [...staticRoutes, ...caseRoutes];
}
