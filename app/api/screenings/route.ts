import { NextResponse } from "next/server";
import { getScreenings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const screenings = await getScreenings();
  return NextResponse.json({ screenings });
}
