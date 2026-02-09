import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "CSV export moved to backend service." }, { status: 410 });
}
