'use client';

import Image from "@/components/SafeImage";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export interface Vehicle {
    id: string;
    slug: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    type: string;
    mileage: number;
    fuelType?: string;
    transmission?: string;
    color?: string;
    images: string[];
    isFeatured?: boolean;
    isAvailable?: boolean;
    status?: string;
    description?: string;
    createdAt?: string;
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
    const { lang, t } = useLanguage();

    const isSold = vehicle.status === "Vendido";

    const price = new Intl.NumberFormat("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(vehicle.price);

    const mileageDisplay = `${vehicle.mileage.toLocaleString("en-US")} mi`;
    const title = `${vehicle.year} ${vehicle.brand} ${vehicle.model}`;

    const firstImage = vehicle.images?.[0];
    const isBroken = !firstImage || firstImage.includes("res.cloudinary.com");
    const imageUrl = isBroken ? "/placeholder-car.svg" : firstImage;

    return (
        <Link
            href={`/autos/${vehicle.id ?? vehicle.slug}`}
            className={`vcard${isSold ? " is-sold" : ""}`}
        >
            {/* ── Photo — locked 3:2 on every card ── */}
            <div className="vcard-media">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    sizes="(max-width: 578px) 100vw, (max-width: 1099px) 50vw, 33vw"
                    quality={78}
                    loading="lazy"
                />
                {isSold && (
                    <span className="vcard-sold-tag">
                        {lang === "en" ? "Sold" : "Vendido"}
                    </span>
                )}
            </div>

            {/* ── Details ── */}
            <div className="vcard-body">
                <p className="vcard-title">{title}</p>

                <div className="vcard-figures">
                    <span className="vcard-price">${price}*</span>
                    <span className="vcard-mileage">{mileageDisplay}</span>
                </div>
            </div>

            <div className="vcard-foot">
                <p className="vcard-foot-label">
                    {isSold ? (lang === "en" ? "Sold at" : "Vendido en") : t.catalog.availableAt}
                </p>
                <p className="vcard-foot-name">FF Speed Cars</p>
            </div>
        </Link>
    );
}
