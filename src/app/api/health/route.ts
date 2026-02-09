import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "company-secretariat-solution",
    timestamp: new Date().toISOString(),
  });
}
