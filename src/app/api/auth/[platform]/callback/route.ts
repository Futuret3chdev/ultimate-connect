import { NextRequest, NextResponse } from "next/server";
import { PLATFORMS, PlatformId } from "@/lib/platforms";
import { getStoredTokens, setStoredTokens } from "@/lib/tokens";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform: platformParam } = await params;
  const platform = platformParam as PlatformId;
  const config = PLATFORMS[platform];
  if (!config || !("tokenUrl" in config)) {
    return NextResponse.redirect(new URL("/?error=unsupported", request.url));
  }

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }
  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  const cookieState = request.cookies.get(`oauth_state_${platform}`)?.value;
  if (state !== cookieState) {
    return NextResponse.redirect(new URL("/?error=state_mismatch", request.url));
  }

  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/?error=missing_credentials", request.url));
  }

  const redirectUri = `${process.env.NEXTAUTH_URL || request.nextUrl.origin}/api/auth/${platform}/callback`;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
  });

  if (platform === "twitter") {
    const codeVerifier = request.cookies.get(`pkce_${platform}`)?.value;
    if (codeVerifier) body.set("code_verifier", codeVerifier);
  } else {
    body.set("client_secret", clientSecret);
  }

  try {
    const tokenRes = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Token exchange failed:", errText);
      return NextResponse.redirect(new URL("/?error=token_exchange_failed", request.url));
    }

    const tokens = await tokenRes.json();

    // Store real tokens
    const existing = await getStoredTokens();
    existing[platform] = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      obtained_at: Date.now(),
    };
    await setStoredTokens(existing);

    // Clean cookies
    const response = NextResponse.redirect(new URL("/?connected=" + platform, request.url));
    response.cookies.delete(`oauth_state_${platform}`);
    if (platform === "twitter") response.cookies.delete(`pkce_${platform}`);
    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/?error=server_error", request.url));
  }
}
