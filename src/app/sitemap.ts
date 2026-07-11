import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://learnnoelia.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/sign-in", "/pricing", "/legal/privacy", "/legal/terms"].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.6,
  }));
}
