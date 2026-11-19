import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Next.js is running inside Docker!",
    timestamp: new Date().toISOString(),
  });
}