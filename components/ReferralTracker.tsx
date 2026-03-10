'use client';

import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface ReferralTrackerProps {
    vehicleName?: string;
}

/**
 * Invisible client component placed on vehicle detail pages.
 * Tracks which vehicles the visitor viewed in sessionStorage,
 * so that info can be included in the lead when they contact.
 */
export default function ReferralTracker({ vehicleName }: ReferralTrackerProps) {
    const pathname = usePathname();

    useEffect(() => {
        if (!vehicleName) return;
        try {
            const viewed: string[] = JSON.parse(
                sessionStorage.getItem("viewedVehicles") || "[]"
            );
            if (!viewed.includes(vehicleName)) {
                viewed.push(vehicleName);
                sessionStorage.setItem("viewedVehicles", JSON.stringify(viewed));
            }
        } catch {
            // silently fail
        }
    }, [vehicleName, pathname]);

    return null; // Renders nothing
}
