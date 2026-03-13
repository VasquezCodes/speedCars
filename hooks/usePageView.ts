"use client";

import { useEffect, useRef } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { PageViewPayload } from "@/types/referral";

/** Reads the referral sellerId from the cookie (set by middleware) or sessionStorage (set by ReferralCapture). */
function getReferrerId(): string | null {
  if (typeof document === "undefined") return null;
  const cookieMatch = document.cookie.match(/(^| )referral=([^;]+)/);
  if (cookieMatch) return decodeURIComponent(cookieMatch[2]);
  if (typeof sessionStorage !== "undefined") {
    return sessionStorage.getItem("referral_pending");
  }
  return null;
}

/**
 * Tracks every page view — no deduplication.
 * Failures are silently swallowed — tracking must never break the page.
 */
export function usePageView(
  vehicleId: string,
  vehicleSlug: string,
  vehicleName: string
): void {
  // Ref persists across React Strict Mode double-invocation — prevents duplicate writes in dev
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    const referrerId = getReferrerId();
    const key = `${vehicleId}_${referrerId ?? "organic"}`;
    if (lastTracked.current === key) return;
    lastTracked.current = key;
    console.log("[usePageView] writing pageView:", vehicleId, "referrerId:", referrerId);

    const payload: PageViewPayload = {
      vehicleId,
      vehicleSlug,
      vehicleName,
      referrerId,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      timestamp: serverTimestamp(),
    };

    addDoc(collection(db, "pageViews"), payload)
      .then(() => console.log("[usePageView] pageView written ✓"))
      .catch((err) => console.error("[usePageView] tracking failed:", err));
  }, [vehicleId, vehicleSlug, vehicleName]);
}
