export default function handler(req, res) {
  try {
    const CLIENT_ID = "34ANBPdRnPmbX9aUifyUs";

    const REDIRECT_URI =
      "https://botdforge.vercel.app/api/auth/deriv/callback";

    const authUrl =
      "https://auth.deriv.com/oauth2/auth" +
      "?response_type=code" +
      "&client_id=" + encodeURIComponent(CLIENT_ID) +
      "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
      "&scope=trade";

    return res.redirect(302, authUrl);

  } catch (error) {

    console.error("Deriv OAuth start error:", error);

    return res.status(500).send(
      "Unable to start Deriv authorization."
    );
  }
}
