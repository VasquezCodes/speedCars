import { NextResponse } from "next/server";
import { SELLER_COOKIE_NAME } from "@/lib/seller-auth";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SELLER_COOKIE_NAME);
  return response;
}
