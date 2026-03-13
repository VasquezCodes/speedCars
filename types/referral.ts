import type { FieldValue } from "firebase/firestore";

/**
 * Firestore Timestamp as serialized by NextResponse.json() when coming from the Admin SDK.
 * The Admin SDK serializes Timestamps as { _seconds, _nanoseconds } (with underscore prefix).
 */
export interface SerializedTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

/**
 * Structural Timestamp interface compatible with both client and admin Firebase SDKs.
 */
export interface FirestoreTimestamp {
  toDate(): Date;
  seconds: number;
  nanoseconds: number;
}

/** Union for timestamp fields that may be a live Timestamp or a serialized one from the API. */
export type AnyTimestamp = FirestoreTimestamp | SerializedTimestamp;

/** Shape of data stored in the `pageViews` Firestore collection (read). */
export interface PageViewDocument {
  vehicleId: string;
  vehicleSlug: string;
  vehicleName: string;
  /** Seller/referrer ID captured from the `?ref=` cookie. Null if visitor arrived organically. */
  referrerId: string | null;
  userAgent: string;
  timestamp: AnyTimestamp;
}

/** `pageViews` document with Firestore ID attached (used in admin UI). */
export interface PageViewRecord extends PageViewDocument {
  id: string;
}

/**
 * Payload sent to Firestore when writing a new page view.
 * `timestamp` is a FieldValue (serverTimestamp) before Firestore resolves it.
 */
export interface PageViewPayload extends Omit<PageViewDocument, "timestamp"> {
  timestamp: FieldValue;
}

/** Per-referrer aggregated stats for the admin panel. */
export interface ReferralStats {
  referrerId: string;        // referral code (key used for grouping)
  sellerName?: string;       // resolved seller name (if code matches an active seller)
  sellerId?: string;         // Firestore seller doc ID
  totalViews: number;
  uniqueVehicles: number;
  totalAppointments: number;
  lastActivity: AnyTimestamp;
}

/** Appointment record enriched with referrer info for the admin panel. */
export interface AppointmentRecord {
  id: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  referrerId: string | null;
  vehicleName?: string;
  createdAt: AnyTimestamp;
}

/** API response shape for GET /api/admin/referrals */
export interface ReferralsApiResponse {
  stats: ReferralStats[];
  recentViews: PageViewRecord[];
  recentAppointments: AppointmentRecord[];
}
