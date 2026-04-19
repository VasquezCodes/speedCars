import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import VehicleDetailNav from "@/components/VehicleDetailNav";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Vehicle } from "@/types/vehicle";
import VehicleDetailClient from "@/components/VehicleDetailClient";
import ReferralTracker from "@/components/ReferralTracker";
import type { Metadata } from "next";

interface Params {
    params: Promise<{ slug: string }>;
}

async function getVehicle(slugOrId: string): Promise<Vehicle | null> {
    try {
        // Try by Firestore document ID first (new links use vehicle.id)
        const byId = await adminDb.collection("vehicles").doc(slugOrId).get();
        if (byId.exists) return { id: byId.id, ...byId.data() } as Vehicle;

        // Fallback: query by slug for old/shared links
        const snap = await adminDb
            .collection("vehicles")
            .where("slug", "==", slugOrId)
            .limit(1)
            .get();
        if (snap.empty) return null;
        const doc = snap.docs[0];
        return { id: doc.id, ...doc.data() } as Vehicle;
    } catch {
        return null;
    }
}

const SITE_URL = "https://ffspeedcars.com";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { slug } = await params;
    const vehicle = await getVehicle(slug);
    if (!vehicle) return {};

    const title = `${vehicle.year} ${vehicle.brand} ${vehicle.model}`;
    const description = vehicle.description
        || `${vehicle.year} ${vehicle.brand} ${vehicle.model} for sale in Fort Worth, TX. ${vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles.` : ""} ${vehicle.price ? `$${vehicle.price.toLocaleString()}.` : ""} Clean title, inspected, ready to drive.`;
    const image = vehicle.images?.[0] || `${SITE_URL}/og-image.jpg`;
    const canonical = `${SITE_URL}/autos/${slug}`;

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            title: `${title} | FF Speed Cars`,
            description,
            url: canonical,
            siteName: "FF Speed Cars",
            type: "website",
            images: [{ url: image, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | FF Speed Cars`,
            description,
            images: [image],
        },
    };
}

export default async function VehicleDetailPage({ params }: Params) {
    const { slug } = await params;
    const vehicle = await getVehicle(slug);

    if (!vehicle) notFound();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Car",
        name: `${vehicle.year} ${vehicle.brand} ${vehicle.model}`,
        description: vehicle.description || `${vehicle.year} ${vehicle.brand} ${vehicle.model} for sale in Fort Worth, TX.`,
        brand: { "@type": "Brand", name: vehicle.brand },
        model: vehicle.model,
        vehicleModelDate: String(vehicle.year),
        mileageFromOdometer: vehicle.mileage
            ? { "@type": "QuantitativeValue", value: vehicle.mileage, unitCode: "SMI" }
            : undefined,
        offers: vehicle.price
            ? {
                "@type": "Offer",
                price: vehicle.price,
                priceCurrency: "USD",
                availability: vehicle.status === "sold"
                    ? "https://schema.org/SoldOut"
                    : "https://schema.org/InStock",
                url: `${SITE_URL}/autos/${slug}`,
                seller: { "@type": "AutoDealer", name: "FF Speed Cars" },
              }
            : undefined,
        image: vehicle.images?.[0],
        url: `${SITE_URL}/autos/${slug}`,
        vehicleTransmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
        bodyType: vehicle.type,
        color: vehicle.color,
        itemCondition: "https://schema.org/UsedCondition",
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            {/* Desktop: full Navbar */}
            <div style={{ display: "none" }} className="vd-show-desktop">
                <Navbar />
            </div>
            {/* Mobile: compact nav with logo + social + search */}
            <div style={{ display: "none" }} className="vd-show-mobile">
                <VehicleDetailNav />
            </div>
            <style>{`
                @media (min-width: 993px) { .vd-show-desktop { display: block !important; } }
                @media (max-width: 992px)  { .vd-show-mobile  { display: block !important; } }
            `}</style>
            <ReferralTracker
                vehicleId={vehicle.id ?? slug}
                vehicleSlug={slug}
                vehicleName={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
            />
            <main style={{ minHeight: "80vh" }}>
                <VehicleDetailClient vehicle={vehicle} />
            </main>
            <Footer />
        </>
    );
}
