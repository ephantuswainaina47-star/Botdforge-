export default function handler(req, res) {
  try {
    const CLIENT_ID = "34ANBPdRnPmbX9aUifyUs";

    const REDIRECT_URI =
      "https://botdforge.vercel.app/api/auth/deriv/callback";

    // ---------------------------------------
    // Generate random state
    // ---------------------------------------

    const stateBytes = new Uint8Array(32);

    crypto.getRandomValues(stateBytes);

    const state = Array.from(stateBytes)
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");

    // ---------------------------------------
    // Generate PKCE verifier
    // ---------------------------------------

    const verifierBytes = new Uint8Array(64);

    crypto.getRandomValues(verifierBytes);

    const allowedChars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

    let codeVerifier = "";

    for (const byte of verifierBytes) {
      codeVerifier +=
        allowedChars[byte % allowedChars.length];
    }

    // ---------------------------------------
    // Generate PKCE challenge
    // ---------------------------------------

    return crypto.subtle
      .digest(
        "SHA-256",
        new TextEncoder().encode(codeVerifier)
      )
      .then(hash => {

        const codeChallenge = Buffer.from(hash)
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        // ---------------------------------------
        // Save state and verifier in cookies
        // ---------------------------------------

        const stateCookie = [
          `botforge_oauth_state=${encodeURIComponent(state)}`,
          "Path=/",
          "HttpOnly",
          "Secure",
          "SameSite=Lax",
          "Max-Age=600"
        ].join("; ");

        const verifierCookie = [
          `botforge_pkce_verifier=${encodeURIComponent(codeVerifier)}`,
          "Path=/",
          "HttpOnly",
          "Secure",
          "SameSite=Lax",
          "Max-Age=600"
        ].join("; ");

        // ---------------------------------------
        // Build Deriv authorization URL
        // ---------------------------------------

        const authUrl =
          "https://auth.deriv.com/oauth2/auth" +
          "?response_type=code" +
          "&client_id=" +
          encodeURIComponent(CLIENT_ID) +
          "&redirect_uri=" +
          encodeURIComponent(REDIRECT_URI) +
          "&scope=trade" +
          "&state=" +
          encodeURIComponent(state) +
          "&code_challenge=" +
          encodeURIComponent(codeChallenge) +
          "&code_challenge_method=S256";

        res.setHeader("Set-Cookie", [
          stateCookie,
          verifierCookie
        ]);

        return res.redirect(302, authUrl);
      });

  } catch (error) {

    console.error(
      "Deriv OAuth start error:",
      error
    );

    return res.status(500).send(
      "Unable to start Deriv authorization."
    );
  }
        }
