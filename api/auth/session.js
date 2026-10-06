export default async function handler(req, res) {
  try {
    // Temporary session endpoint.
    // We will connect this to the secure BotForge
    // session cookie in the next backend step.

    return res.status(200).json({
      authenticated: false,
      message: "BotForge session endpoint is working."
    });

  } catch (error) {
    console.error(
      "BotForge session error:",
      error
    );

    return res.status(500).json({
      authenticated: false,
      error: "Session service unavailable."
    });
  }
}
