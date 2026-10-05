export default async function handler(req, res) {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.status(400).send(`
      <html>
        <body style="font-family:Arial;text-align:center;padding:40px">
          <h2>Deriv OAuth Error</h2>
          <p><strong>${error}</strong></p>
          <p>${error_description || "No additional information was provided."}</p>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send(`
      <html>
        <body style="font-family:Arial;text-align:center;padding:40px">
          <h2>No authorization code received</h2>
          <p>Deriv did not return an authorization code.</p>
          <p>We need to inspect the OAuth response.</p>
        </body>
      </html>
    `);
  }

  return res.status(200).send(`
    <html>
      <body style="font-family:Arial;text-align:center;padding:40px">
        <h2>Deriv authorization received ✅</h2>
        <p>Authorization code received successfully.</p>
        <p>Next we will connect the secure token exchange.</p>
      </body>
    </html>
  `);
}
