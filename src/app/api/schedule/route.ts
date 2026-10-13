import { NextRequest, NextResponse } from "next/server";
import { getStoredTokens, setStoredTokens } from "@/lib/tokens";

// Simple in-cookie schedule store for this version. Production: use Vercel Postgres + cron.
export async function POST(request: NextRequest) {
  const { content, platforms, scheduledAt } = await request.json();
  if (!content || !platforms?.length || !scheduledAt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const tokens = await getStoredTokens();
  if (!tokens.schedules) tokens.schedules = [];
  tokens.schedules.push({
    id: crypto.randomUUID(),
    content,
    platforms,
    scheduledAt,
    status: "pending",
  });
  await setStoredTokens(tokens);

  return NextResponse.json({ success: true, message: "Scheduled. Real cron processing requires database + Vercel Cron." });
}

export async function GET() {
  const tokens = await getStoredTokens();
  return NextResponse.json({ schedules: tokens.schedules || [] });
}
