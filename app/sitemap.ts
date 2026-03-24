import type { MetadataRoute } from "next";
import { adminDb } from "@/lib/firebase/admin";

const SITE_URL = "https://ffspeedcars.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
        { url: `${SITE_URL}/autos`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ];

    try {
        const snap = await adminDb
            .collection("vehicles")
            .where("status", "!=", "deleted")
            .get();

        const vehicleRoutes: MetadataRoute.Sitemap = snap.docs
            .filter((doc) => doc.data().slug)
            .map((doc) => {
                const data = doc.data();
                return {
                    url: `${SITE_URL}/autos/${data.slug}`,
                    lastModified: data.updatedAt?.toDate?.() ?? new Date(),
                    changeFrequency: "weekly" as const,
                    priority: data.status === "sold" ? 0.4 : 0.8,
                };
            });

        return [...staticRoutes, ...vehicleRoutes];
    } catch {
        return staticRoutes;
    }
}
