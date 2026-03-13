import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { SellerSessionPayload } from "@/types/seller";

const SALT_ROUNDS = 12;
const SESSION_DURATION = "7d";
const COOKIE_NAME = "seller_session";

function getSecret(): Uint8Array {
  const secret = process.env.SELLER_JWT_SECRET;
  if (!secret) throw new Error("SELLER_JWT_SECRET env variable is not set");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSellerToken(payload: SellerSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());
}

export async function verifySellerToken(token: string): Promise<SellerSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SellerSessionPayload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME as SELLER_COOKIE_NAME };
export const SELLER_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
