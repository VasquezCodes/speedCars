/* Fuzzy search helpers — pure, client-safe (no server imports). */

export function levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length;
    // dp[j] = edit distance between a[0..i-1] and b[0..j-1]
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
export function fuzzyMatch(query: string, text: string | undefined): boolean {
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
