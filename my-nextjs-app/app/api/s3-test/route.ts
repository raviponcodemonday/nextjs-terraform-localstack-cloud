import { NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

// 1. ตั้งค่าการเชื่อมต่อ S3 (ชี้ไปที่ LocalStack)
const s3Client = new S3Client({
  region: "ap-southeast-1",
  endpoint: process.env.AWS_ENDPOINT_URL || "http://localhost:4566",
  forcePathStyle: true, // สำคัญมาก! บังคับใช้รูปแบบ URL ของ LocalStack
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

const BUCKET_NAME = "my-dream-cloud-storage";

// 2. เมื่อกดปุ่ม "อัปโหลดไฟล์" (POST) -> โยนไฟล์ขึ้น S3
export async function POST() {
  try {
    const fileName = `note-${Date.now()}.txt`;
    const fileContent = `Hello from Next.js inside Docker! Created at ${new Date().toISOString()}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
        ContentType: "text/plain",
      })
    );

    return NextResponse.json({
      success: true,
      message: `อัปโหลดไฟล์ ${fileName} สำเร็จ!`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 3. เมื่อเปิดดูรายการไฟล์ (GET) -> ดึงรายชื่อไฟล์ทั้งหมดใน S3
export async function GET() {
  try {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
      })
    );

    const files = response.Contents?.map((item) => ({
      name: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
    })) || [];

    return NextResponse.json({ success: true, bucket: BUCKET_NAME, files });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}