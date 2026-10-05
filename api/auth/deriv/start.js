export default function handler(req, res) {
  const clientId = "34ANBPdRnPmbX9aUifyUs";

  const redirectUri =
    "https://botdforge.vercel.app/api/auth/deriv/callback";

  const authUrl =
    "https://auth.deriv.com/oauth2/auth" +
    "?response_type=code" +
    "&client_id=" + encodeURIComponent(clientId) +
    "&redirect_uri=" + encodeURIComponent(redirectUri);

  res.redirect(authUrl);
}
