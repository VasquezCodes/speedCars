import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

/* ── Fuzzy search helpers ─────────────────────────────────── */

function levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length;
    // dp[i][j] = edit distance between a[0..i-1] and b[0..j-1]
    const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
        let prev = dp[0];
        dp[0] = i;
        for (let j = 1; j <= n; j++) {
            const temp = dp[j];
            dp[j] = a[i - 1] === b[j - 1]
                ? prev
                : 1 + Math.min(prev, dp[j], dp[j - 1]);
            prev = temp;
        }
    }
    return dp[n];
}

// Returns true if `query` fuzzy-matches `text`
function fuzzyMatch(query: string, text: string | undefined): boolean {
    if (!text) return false;
    const q = query.toLowerCase().trim();
    const t = text.toLowerCase();
    if (!q) return true;

    // Fast path: exact substring match
    if (t.includes(q)) return true;

    // Word-by-word fuzzy: every query word must fuzzy-match at least one text word
    const qWords = q.split(/\s+/).filter(Boolean);
    const tWords = t.split(/\s+/).filter(Boolean);

    return qWords.every((qw) => {
        // Allow 1 typo per 4 chars (min 1 for words ≥ 3 chars, 0 for very short)
        const maxDist = qw.length >= 3 ? Math.max(1, Math.floor(qw.length / 4)) : 0;
        return tWords.some((tw) =>
            tw.includes(qw) || qw.includes(tw) || levenshtein(qw, tw) <= maxDist
        );
    });
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const brand = searchParams.get("brand");
        const type = searchParams.get("type");
        const maxPrice = searchParams.get("maxPrice");
        const maxMileage = searchParams.get("maxMileage");
        const fuelType = searchParams.get("fuelType"); // comma-separated
        const search = searchParams.get("search");
        const featured = searchParams.get("featured");

        // Use only a single where clause to avoid composite index requirements.
        // All secondary filters are applied in JavaScript.
        const snap = await adminDb
            .collection("vehicles")
            .where("isAvailable", "==", true)
            .orderBy("createdAt", "desc")
            .get();

        let vehicles = snap.docs.map((doc) => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
            } as any;
        });

        if (brand) vehicles = vehicles.filter((v) => v.brand === brand);
        if (type) vehicles = vehicles.filter((v) => v.type === type);
        if (featured === "true") vehicles = vehicles.filter((v) => v.isFeatured);
        if (maxPrice) vehicles = vehicles.filter((v) => v.price <= parseInt(maxPrice));
        if (maxMileage) vehicles = vehicles.filter((v) => v.mileage <= parseInt(maxMileage));
        if (fuelType) {
            const fuelList = fuelType.split(",");
            vehicles = vehicles.filter((v) => fuelList.includes(v.fuelType));
        }
        if (search) {
            const q = search.trim();
            vehicles = vehicles.filter(
                (v) =>
                    v.year?.toString().includes(q) ||          // year: exact
                    fuzzyMatch(q, v.brand) ||                  // brand: fuzzy
                    fuzzyMatch(q, v.model) ||                  // model: fuzzy
                    fuzzyMatch(q, `${v.brand} ${v.model}`) ||  // "ford focus": combined
                    fuzzyMatch(q, v.description)               // description: fuzzy
            );
        }

        return NextResponse.json(vehicles);
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        return NextResponse.json(
            { error: "Error al obtener vehículos" },
            { status: 500 }
        );
    }
}
