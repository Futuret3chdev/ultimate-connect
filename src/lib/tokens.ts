import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production");

export async function encryptTokens(tokens: Record<string, any>) {
  return await new SignJWT(tokens)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function decryptTokens(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as Record<string, any>;
  } catch {
    return null;
  }
}

export async function getStoredTokens() {
  const cookieStore = await cookies();
  const token = cookieStore.get("social_tokens")?.value;
  if (!token) return {};
  return (await decryptTokens(token)) || {};
}

export async function setStoredTokens(tokens: Record<string, any>) {
  const encrypted = await encryptTokens(tokens);
  const cookieStore = await cookies();
  cookieStore.set("social_tokens", encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
}
