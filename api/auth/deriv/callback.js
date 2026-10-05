export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("Missing Deriv authorization code.");
  }

  // Temporary response.
  // We will connect the secure token exchange and Supabase
  // after confirming the OAuth redirect works.
  res.status(200).send(`
    <html>
      <body style="font-family:Arial;text-align:center;padding:40px">
        <h2>Deriv authorization received ✅</h2>
        <p>BotForge received the authorization code.</p>
        <p>Next we will securely exchange it for the Deriv access token.</p>
      </body>
    </html>
  `);
}
