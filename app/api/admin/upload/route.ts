import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];

        if (!files.length) {
            return NextResponse.json({ error: "No files provided" }, { status: 400 });
        }

        const urls: string[] = [];

        for (const file of files) {
            if (file.size > MAX_SIZE) {
                return NextResponse.json(
                    { error: `File ${file.name} exceeds 10 MB limit` },
                    { status: 400 },
                );
            }

            const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
            const key = `vehicles/${randomUUID()}.${ext}`;
            const buffer = Buffer.from(await file.arrayBuffer());

            await s3.send(
                new PutObjectCommand({
                    Bucket: BUCKET,
                    Key: key,
                    Body: buffer,
                    ContentType: file.type,
                }),
            );

            urls.push(`${PUBLIC_URL}/${key}`);
        }

        return NextResponse.json({ urls });
    } catch (err: any) {
        console.error("R2 upload error:", err);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
