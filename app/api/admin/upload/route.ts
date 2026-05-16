import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

type FileMeta = { name: string; type: string };

export async function POST(req: NextRequest) {
    try {
        const { files } = (await req.json()) as { files?: FileMeta[] };

        if (!Array.isArray(files) || !files.length) {
            return NextResponse.json({ error: "No files provided" }, { status: 400 });
        }

        console.log("[upload presign] firmando %d archivos", files.length, files.map((f) => ({ name: f.name, type: f.type })));

        const results = await Promise.all(
            files.map(async (f) => {
                const ext = f.name.split(".").pop()?.toLowerCase() || "jpg";
                const key = `vehicles/${randomUUID()}.${ext}`;
                const command = new PutObjectCommand({
                    Bucket: BUCKET,
                    Key: key,
                    ContentType: f.type || "image/jpeg",
                });
                const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
                return { uploadUrl, publicUrl: `${PUBLIC_URL}/${key}` };
            }),
        );

        return NextResponse.json({ files: results });
    } catch (err: any) {
        console.error("[upload presign] error:", { message: err?.message, code: err?.code, stack: err?.stack });
        return NextResponse.json({ error: err?.message || "Failed to create upload URLs" }, { status: 500 });
    }
}
