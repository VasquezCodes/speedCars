"use client";

export const REFERRAL_SESSION_KEY = "referral_pending";

/**
 * Invisible component — captures ?ref= from URL into sessionStorage.
 *
 * Reads window.location.search directly (no useSearchParams / no Suspense)
 * so the write happens synchronously during the render phase, guaranteed to
 * complete before any child useEffect fires.
 */
export default function ReferralCapture() {
  if (typeof window !== "undefined") {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      sessionStorage.setItem(REFERRAL_SESSION_KEY, ref);
    }
  }
  return null;
}
