export default async function handler(req, res) {
  const clientId = "34ANBPdRnPmbX9aUifyUs";

  const redirectUri =
    "https://botdforge.vercel.app/api/auth/deriv/callback";

  // Generate a secure random state
  const stateBytes = new Uint8Array(16);
  crypto.getRandomValues(stateBytes);

  const state = Array.from(stateBytes)
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");

  // Generate PKCE code verifier
  const verifierBytes = new Uint8Array(64);
  crypto.getRandomValues(verifierBytes);

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

  let codeVerifier = "";

  for (const byte of verifierBytes) {
    codeVerifier += chars[byte % chars.length];
  }

  // Create SHA-256 code challenge
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier)
  );

  const codeChallenge = Buffer.from(hash)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const authUrl = new URL(
    "https://auth.deriv.com/oauth2/auth"
  );

  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);

  // We will use trading access for BotForge later.
  authUrl.searchParams.set(
    "scope",
    "trade account_manage"
  );

  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  res.redirect(authUrl.toString());
    }
