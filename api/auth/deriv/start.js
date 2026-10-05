export default async function handler(req, res) {
  try {
    const CLIENT_ID = "34ANBPdRnPmbX9aUifyUs";

    const REDIRECT_URI =
      "https://botdforge.vercel.app/api/auth/deriv/callback";

    // Generate random state
    const stateBytes = new Uint8Array(16);
    crypto.getRandomValues(stateBytes);

    const state = Array.from(stateBytes)
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");

    // Generate PKCE code verifier
    const verifierBytes = new Uint8Array(64);
    crypto.getRandomValues(verifierBytes);

    const allowedChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

    let codeVerifier = "";

    for (const byte of verifierBytes) {
      codeVerifier += allowedChars[byte % allowedChars.length];
    }

    // Generate SHA-256 code challenge
    const hash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(codeVerifier)
    );

    const codeChallenge = Buffer.from(hash)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Store state + verifier in secure cookies.
    // The callback will read these after Deriv redirects back.
    const cookie = [
      `botforge_oauth_state=${encodeURIComponent(state)}`,
      `Path=/`,
      `HttpOnly`,
      `Secure`,
      `SameSite=Lax`,
      `Max-Age=600`
    ].join("; ");

    const verifierCookie = [
      `botforge_pkce_verifier=${encodeURIComponent(codeVerifier)}`,
      `Path=/`,
      `HttpOnly`,
      `Secure`,
      `SameSite=Lax`,
      `Max-Age=600`
    ].join("; ");

    const authUrl = new URL(
      "https://auth.deriv.com/oauth2/auth"
    );

    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", REDIRECT_URI);

    // Your Deriv app currently accepts this scope.
    authUrl.searchParams.set("scope", "trade");

    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    res.setHeader("Set-Cookie", [
      cookie,
      verifierCookie
    ]);

    return res.redirect(
      302,
      authUrl.toString()
    );

  } catch (error) {
    console.error("Deriv OAuth start error:", error);

    return res.status(500).send(
      "Unable to start Deriv authorization."
    );
  }
}
