export default async function handler(req, res) {
  try {
    const {
      code,
      state,
      error,
      error_description
    } = req.query;

    // Deriv returned an OAuth error
    if (error) {
      return res.status(400).send(`
        <html>
          <head>
            <title>BotForge - Deriv Login Error</title>
            <meta name="viewport" content="width=device-width,initial-scale=1">
          </head>

          <body style="
            margin:0;
            background:#060A1A;
            color:white;
            font-family:Arial,sans-serif;
            display:flex;
            align-items:center;
            justify-content:center;
            min-height:100vh;
            text-align:center;
          ">

            <div style="
              width:90%;
              max-width:500px;
              padding:30px;
              background:#10152b;
              border-radius:18px;
            ">

              <h2 style="color:#ff5c7a">
                Deriv Login Error
              </h2>

              <p>
                ${error}
              </p>

              <p style="color:#aaa">
                ${error_description || "Deriv did not provide more information."}
              </p>

            </div>

          </body>
        </html>
      `);
    }

    // No authorization code
    if (!code) {
      return res.status(400).send(`
        <html>
          <head>
            <title>BotForge - Login Error</title>
            <meta name="viewport" content="width=device-width,initial-scale=1">
          </head>

          <body style="
            margin:0;
            background:#060A1A;
            color:white;
            font-family:Arial,sans-serif;
            display:flex;
            align-items:center;
            justify-content:center;
            min-height:100vh;
            text-align:center;
          ">

            <div style="
              width:90%;
              max-width:500px;
              padding:30px;
              background:#10152b;
              border-radius:18px;
            ">

              <h2>
                No Authorization Code
              </h2>

              <p style="color:#aaa">
                Deriv did not return an authorization code.
              </p>

            </div>

          </body>
        </html>
      `);
    }

    // Authorization succeeded.
    // The next backend step will securely exchange
    // this authorization code for the Deriv access token.
    return res.status(200).send(`
      <html>
        <head>
          <title>BotForge - Deriv Connected</title>
          <meta name="viewport" content="width=device-width,initial-scale=1">
        </head>

        <body style="
          margin:0;
          background:#060A1A;
          color:white;
          font-family:Arial,sans-serif;
          display:flex;
          align-items:center;
          justify-content:center;
          min-height:100vh;
          text-align:center;
        ">

          <div style="
            width:90%;
            max-width:500px;
            padding:30px;
            background:#10152b;
            border-radius:18px;
          ">

            <div style="font-size:50px">
              ✓
            </div>

            <h2 style="color:#7dffb2">
              Deriv Authorization Successful
            </h2>

            <p style="color:#aaa">
              BotForge received your Deriv authorization.
            </p>

            <p>
              Next step: secure token exchange.
            </p>

          </div>

        </body>
      </html>
    `);

  } catch (error) {
    console.error("Deriv callback error:", error);

    return res.status(500).send(`
      <html>
        <body style="
          background:#060A1A;
          color:white;
          font-family:Arial;
          text-align:center;
          padding:40px;
        ">

          <h2>BotForge Callback Error</h2>

          <p>
            ${error.message || "Unknown error"}
          </p>

        </body>
      </html>
    `);
  }
  }
