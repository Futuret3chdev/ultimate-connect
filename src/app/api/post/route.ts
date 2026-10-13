import { NextRequest, NextResponse } from "next/server";
import { PLATFORMS, PlatformId } from "@/lib/platforms";
import { getStoredTokens } from "@/lib/tokens";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content, platforms, imageUrl } = body as {
    content: string;
    platforms: PlatformId[];
    imageUrl?: string;
  };

  if (!content?.trim() && !imageUrl) {
    return NextResponse.json({ error: "Content or image required" }, { status: 400 });
  }
  if (!platforms?.length) {
    return NextResponse.json({ error: "Select at least one platform" }, { status: 400 });
  }

  const tokens = await getStoredTokens();
  const results: Record<string, any> = {};

  for (const platform of platforms) {
    const tokenData = tokens[platform];
    if (!tokenData?.access_token) {
      results[platform] = { success: false, error: "Not connected. Connect the account first." };
      continue;
    }

    try {
      if (platform === "twitter") {
        const res = await fetch(PLATFORMS.twitter.postUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: content.slice(0, 280) }),
        });
        const data = await res.json();
        results[platform] = res.ok
          ? { success: true, id: data.data?.id, url: `https://x.com/i/status/${data.data?.id}` }
          : { success: false, error: data.detail || data.title || "Post failed" };
      } else if (platform === "linkedin") {
        // Simplified UGC post – real implementation needs person URN
        const res = await fetch(PLATFORMS.linkedin.postUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify({
            author: "urn:li:person:me", // Placeholder – real needs /v2/me
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text: content.slice(0, 3000) },
                shareMediaCategory: "NONE",
              },
            },
            visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
          }),
        });
        const data = await res.json();
        results[platform] = res.ok
          ? { success: true, id: data.id }
          : { success: false, error: data.message || "LinkedIn post failed" };
      } else if (platform === "facebook") {
        const res = await fetch(PLATFORMS.facebook.postUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
          body: new URLSearchParams({ message: content.slice(0, 63206) }),
        });
        const data = await res.json();
        results[platform] = res.ok
          ? { success: true, id: data.id }
          : { success: false, error: data.error?.message || "Facebook post failed" };
      } else {
        results[platform] = { success: false, error: "Platform posting not yet fully implemented" };
      }
    } catch (e: any) {
      results[platform] = { success: false, error: e.message || "Network error" };
    }
  }

  return NextResponse.json({ results });
}
