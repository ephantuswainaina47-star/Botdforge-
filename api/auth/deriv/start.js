export default function handler(req, res) {
  try {
    const CLIENT_ID = "34ANBPdRnPmbX9aUifyUs";

    const REDIRECT_URI =
      "https://botdforge.vercel.app/api/auth/deriv/callback";

    // Generate a secure random state
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);

    const state = Array.from(randomBytes)
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");

    const authUrl =
      "https://auth.deriv.com/oauth2/auth" +
      "?response_type=code" +
      "&client_id=" +
      encodeURIComponent(CLIENT_ID) +
      "&redirect_uri=" +
      encodeURIComponent(REDIRECT_URI) +
      "&scope=trade" +
      "&state=" +
      encodeURIComponent(state);

    return res.redirect(302, authUrl);

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
