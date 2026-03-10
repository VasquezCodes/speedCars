import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Vehicle } from "@/components/VehicleCard";
import VehicleDetailClient from "@/components/VehicleDetailClient";
import ReferralTracker from "@/components/ReferralTracker";
import type { Metadata } from "next";

interface Params {
    params: Promise<{ slug: string }>;
}

async function getVehicle(slug: string): Promise<Vehicle | null> {
    try {
        const snap = await adminDb
            .collection("vehicles")
            .where("slug", "==", slug)
            .limit(1)
            .get();
        if (snap.empty) return null;
        const doc = snap.docs[0];
        return { id: doc.id, ...doc.data() } as Vehicle;
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { slug } = await params;
    const vehicle = await getVehicle(slug);
    if (!vehicle) return {};
    return {
        title: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
        description: vehicle.description || `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${vehicle.type} disponible en AutosDealer.`,
    };
}

export default async function VehicleDetailPage({ params }: Params) {
    const { slug } = await params;
    const vehicle = await getVehicle(slug);

    if (!vehicle) notFound();

    return (
        <>
            <Navbar />
            <ReferralTracker vehicleName={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`} />
            <main style={{ minHeight: "80vh" }}>
                <VehicleDetailClient vehicle={vehicle} />
            </main>
            <Footer />
        </>
    );
}
