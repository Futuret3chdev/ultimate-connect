import { NextRequest, NextResponse } from "next/server";
import { PLATFORMS, PlatformId } from "@/lib/platforms";

export async function GET(
  request: NextRequest,
  { params }: { params: { platform: string } }
) {
  const platform = params.platform as PlatformId;
  const config = PLATFORMS[platform];
  if (!config || !("authUrl" in config)) {
    return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
  }

  const clientId = process.env[config.clientIdEnv];
  if (!clientId) {
    return NextResponse.json(
      { error: `Missing ${config.clientIdEnv} environment variable. Create a developer app and set it.` },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXTAUTH_URL || request.nextUrl.origin}/api/auth/${platform}/callback`;
  const state = crypto.randomUUID();

  const paramsObj = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: config.scopes.join(" "),
    state,
  });

  // PKCE for Twitter
  if (platform === "twitter") {
    const codeVerifier = crypto.randomUUID() + crypto.randomUUID();
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    paramsObj.set("code_challenge", codeChallenge);
    paramsObj.set("code_challenge_method", "S256");
    // Store verifier in cookie for callback
    const response = NextResponse.redirect(`${config.authUrl}?${paramsObj}`);
    response.cookies.set(`pkce_${platform}`, codeVerifier, { httpOnly: true, maxAge: 600, path: "/" });
    response.cookies.set(`oauth_state_${platform}`, state, { httpOnly: true, maxAge: 600, path: "/" });
    return response;
  }

  const response = NextResponse.redirect(`${config.authUrl}?${paramsObj}`);
  response.cookies.set(`oauth_state_${platform}`, state, { httpOnly: true, maxAge: 600, path: "/" });
  return response;
}
