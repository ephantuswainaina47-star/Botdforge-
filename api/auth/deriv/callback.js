export default async function handler(req, res) {
  try {

    const CLIENT_ID =
      "34ANBPdRnPmbX9aUifyUs";

    const REDIRECT_URI =
      "https://botdforge.vercel.app/api/auth/deriv/callback";

    // ---------------------------------------
    // Read OAuth parameters
    // ---------------------------------------

    const {
      code,
      state,
      error,
      error_description
    } = req.query;

    // ---------------------------------------
    // Handle Deriv OAuth error
    // ---------------------------------------

    if (error) {

      return res.status(400).send(`
        <html>

          <head>
            <title>BotForge - Deriv Login Error</title>

            <meta
              name="viewport"
              content="width=device-width,initial-scale=1"
            >
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

              <h2 style="
                color:#ff5c7a;
              ">
                Deriv Login Error
              </h2>

              <p>
                ${error}
              </p>

              <p style="
                color:#aaa;
              ">
                ${error_description || ""}
              </p>

            </div>

          </body>

        </html>
      `);
    }

    // ---------------------------------------
    // Read cookies
    // ---------------------------------------

    const cookieHeader =
      req.headers.cookie || "";

    const cookies = {};

    cookieHeader
      .split(";")
      .forEach(cookie => {

        const parts =
          cookie.trim().split("=");

        if (parts.length >= 2) {

          const name =
            parts.shift();

          const value =
            parts.join("=");

          cookies[name] =
            decodeURIComponent(value);
        }

      });

    // ---------------------------------------
    // Get saved OAuth state
    // ---------------------------------------

    const savedState =
      cookies.botforge_oauth_state;

    // ---------------------------------------
    // Get saved PKCE verifier
    // ---------------------------------------

    const codeVerifier =
      cookies.botforge_pkce_verifier;

    // ---------------------------------------
    // Verify OAuth state
    // ---------------------------------------

    if (
      !state ||
      !savedState ||
      state !== savedState
    ) {

      return res.status(400).send(`
        <html>

          <body style="
            margin:0;
            background:#060A1A;
            color:white;
            font-family:Arial;
            text-align:center;
            padding:40px;
          ">

            <h2>
              OAuth State Error
            </h2>

            <p style="
              color:#ff6b81;
            ">
              OAuth security verification failed.
            </p>

            <p style="
              color:#aaa;
            ">
              Please start the Deriv login again.
            </p>

          </body>

        </html>
      `);
    }

    // ---------------------------------------
    // Check authorization code
    // ---------------------------------------

    if (!code) {

      return res.status(400).send(`
        <html>

          <body style="
            margin:0;
            background:#060A1A;
            color:white;
            font-family:Arial;
            text-align:center;
            padding:40px;
          ">

            <h2>
              Missing Authorization Code
            </h2>

            <p>
              Deriv did not return an authorization code.
            </p>

          </body>

        </html>
      `);
    }

    // ---------------------------------------
    // Check PKCE verifier
    // ---------------------------------------

    if (!codeVerifier) {

      return res.status(400).send(`
        <html>

          <body style="
            margin:0;
            background:#060A1A;
            color:white;
            font-family:Arial;
            text-align:center;
            padding:40px;
          ">

            <h2>
              PKCE Verification Error
            </h2>

            <p>
              The PKCE verifier was not found.
            </p>

          </body>

        </html>
      `);
    }

    // ---------------------------------------
    // Exchange authorization code
    // for Deriv access token
    // ---------------------------------------

    const tokenResponse =
      await fetch(
        "https://auth.deriv.com/oauth2/token",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded"
          },

          body:
            new URLSearchParams({

              grant_type:
                "authorization_code",

              client_id:
                CLIENT_ID,

              code:
                code,

              code_verifier:
                codeVerifier,

              redirect_uri:
                REDIRECT_URI

            })
        }
      );

    // ---------------------------------------
    // Read token response
    // ---------------------------------------

    const tokenData =
      await tokenResponse.json();

    // ---------------------------------------
    // Handle token exchange failure
    // ---------------------------------------

    if (
      !tokenResponse.ok ||
      !tokenData.access_token
    ) {

      console.error(
        "Deriv token exchange error:",
        tokenData
      );

      return res.status(400).send(`
        <html>

          <body style="
            margin:0;
            background:#060A1A;
            color:white;
            font-family:Arial;
            text-align:center;
            padding:40px;
          ">

            <h2>
              Deriv Token Exchange Failed
            </h2>

            <p style="
              color:#ff6b81;
            ">
              ${
                tokenData.error ||
                "Unknown error"
              }
            </p>

            <p style="
              color:#aaa;
            ">
              ${
                tokenData.error_description ||
                "Deriv did not provide more information."
              }
            </p>

          </body>

        </html>
      `);
    }

    // ---------------------------------------
    // TOKEN SUCCESS
    // ---------------------------------------

    const accessToken =
      tokenData.access_token;

    const expiresIn =
      tokenData.expires_in || 3600;

    console.log(
      "Deriv OAuth successful"
    );

    console.log(
      "Token expires in:",
      expiresIn
    );

    // ---------------------------------------
    // IMPORTANT
    // ---------------------------------------
    //
    // DO NOT send the access token
    // to the browser.
    //
    // DO NOT display it.
    //
    // DO NOT put it in the URL.
    //
    // The next backend step will create
    // the BotForge session and connect
    // this Deriv account to Supabase.
    //
    // ---------------------------------------

    if (!accessToken) {

      return res.status(400).send(
        "Deriv did not return an access token."
      );
    }

    // ---------------------------------------
    // Temporary successful response
    // ---------------------------------------

    return res.status(200).send(`
      <html>

        <head>

          <title>
            BotForge - Deriv Connected
          </title>

          <meta
            name="viewport"
            content="width=device-width,initial-scale=1"
          >

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
            padding:35px;
            background:#10152b;
            border-radius:20px;
          ">

            <div style="
              font-size:55px;
              margin-bottom:15px;
            ">
              ✓
            </div>

            <h2 style="
              color:#7dffb2;
            ">
              Deriv Connected
            </h2>

            <p style="
              color:#aaa;
              line-height:1.6;
            ">
              Your Deriv account has been
              successfully authorized with
              BotForge.
            </p>

            <p>
              OAuth authorization is working.
            </p>

          </div>

        </body>

      </html>
    `);

  } catch (error) {

    console.error(
      "BotForge OAuth callback error:",
      error
    );

    return res.status(500).send(`
      <html>

        <body style="
          margin:0;
          background:#060A1A;
          color:white;
          font-family:Arial;
          text-align:center;
          padding:40px;
        ">

          <h2>
            BotForge OAuth Error
          </h2>

          <p style="
            color:#ff6b81;
          ">
            ${
              error.message ||
              "Unknown server error"
            }
          </p>

        </body>

      </html>
    `);
  }
        }
