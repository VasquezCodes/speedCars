import type { AnyTimestamp } from "./referral";

/** Document stored in Firestore `sellers` collection. */
export interface SellerDocument {
  username: string;
  name: string;
  passwordHash: string;
  isActive: boolean;
  createdAt: AnyTimestamp;
}

/** Seller with document ID — used in admin panel. */
export interface SellerRecord extends Omit<SellerDocument, "passwordHash"> {
  id: string;
}

/** Payload encoded in the seller JWT session token. */
export interface SellerSessionPayload {
  sellerId: string;
  username: string;
  name: string;
}

/** Body expected by POST /api/admin/sellers */
export interface CreateSellerBody {
  name: string;
  username: string;
  password: string;
}

/** Body expected by POST /api/seller/login */
export interface SellerLoginBody {
  username: string;
  password: string;
}
