"use client";

import { usePageView } from "@/hooks/usePageView";

interface ReferralTrackerProps {
  vehicleId: string;
  vehicleSlug: string;
  vehicleName: string;
}

/**
 * Invisible client component placed on every vehicle detail page.
 * Delegates tracking to `usePageView`, which writes to Firestore `pageViews`
 * and deduplicates per session so we don't inflate counts on re-renders.
 */
export default function ReferralTracker({
  vehicleId,
  vehicleSlug,
  vehicleName,
}: ReferralTrackerProps) {
  usePageView(vehicleId, vehicleSlug, vehicleName);
  return null;
}
