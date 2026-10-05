
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

    // Generate SHA-256 challenge
    const encoder = new TextEncoder();

    const data = encoder.encode(codeVerifier);

    const digest = await crypto.subtle.digest(
      "SHA-256",
      data
    );

    const codeChallenge = Buffer.from(digest)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Build Deriv OAuth URL
    const authUrl = new URL(
      "https://auth.deriv.com/oauth2/auth"
    );

    authUrl.searchParams.set(
      "response_type",
      "code"
    );

    authUrl.searchParams.set(
      "client_id",
      CLIENT_ID
    );

    authUrl.searchParams.set(
      "redirect_uri",
      REDIRECT_URI
    );

    // Request trading permission only
    authUrl.searchParams.set(
      "scope",
      "trade"
    );

    authUrl.searchParams.set(
      "state",
      state
    );

    authUrl.searchParams.set(
      "code_challenge",
      codeChallenge
    );

    authUrl.searchParams.set(
      "code_challenge_method",
      "S256"
    );

    // Redirect user to Deriv
    return res.redirect(
      302,
      authUrl.toString()
    );

  } catch (error) {
    console.error("Deriv OAuth start error:", error);

    return res.status(500).send(`
      <html>
        <body style="font-family:Arial;text-align:center;padding:40px">
          <h2>BotForge OAuth Error</h2>
          <p>Unable to start Deriv authorization.</p>
          <p>${error.message || "Unknown error"}</p>
        </body>
      </html>
    `);
  }
      }
