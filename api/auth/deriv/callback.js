import {
  supabaseAdmin
} from "../../lib/supabase.js";

import {
  encrypt
} from "../../lib/crypto.js";

import {
  createSession
} from "../../lib/session.js";

export default async function handler(req, res) {
  try {
    const CLIENT_ID =
      "34ANBPdRnPmbX9aUifyUs";

    const REDIRECT_URI =
      "https://botdforge.vercel.app/api/auth/deriv/callback";

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

              <h2 style="color:#ff5c7a;">
                Deriv Login Error
              </h2>

              <p>${escapeHtml(error)}</p>

              <p style="color:#aaa;">
                ${escapeHtml(
                  error_description || ""
                )}
              </p>

            </div>
          </body>
        </html>
      `);
    }

    // ---------------------------------------
    // Read OAuth cookies
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

    const savedState =
      cookies.botforge_oauth_state;

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

            <p style="color:#ff6b81;">
              OAuth security verification failed.
            </p>

            <p style="color:#aaa;">
              Please start Deriv login again.
            </p>

          </body>
        </html>
      `);
    }

    // ---------------------------------------
    // Check authorization code
    // ---------------------------------------

    if (!code) {
      return res.status(400).send(
        "Missing Deriv authorization code."
      );
    }

    // ---------------------------------------
    // Check PKCE verifier
    // ---------------------------------------

    if (!codeVerifier) {
      return res.status(400).send(
        "PKCE verifier missing."
      );
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

              code,

              code_verifier:
                codeVerifier,

              redirect_uri:
                REDIRECT_URI
            })
        }
      );

    const tokenData =
      await tokenResponse.json();

    if (
      !tokenResponse.ok ||
      !tokenData.access_token
    ) {
      console.error(
        "Deriv token exchange failed:",
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

            <p style="color:#ff6b81;">
              ${escapeHtml(
                tokenData.error ||
                "Unknown error"
              )}
            </p>

            <p style="color:#aaa;">
              ${escapeHtml(
                tokenData.error_description ||
                ""
              )}
            </p>

          </body>
        </html>
      `);
    }

    const accessToken =
      tokenData.access_token;

    const expiresIn =
      Number(
        tokenData.expires_in || 3600
      );

    // ---------------------------------------
    // Get Deriv account information
    // ---------------------------------------

    const accountResponse =
      await fetch(
        "https://api.derivws.com/trading/v1/options/accounts",
        {
          method: "GET",

          headers: {
            "Authorization":
              `Bearer ${accessToken}`
          }
        }
      );

    const accountData =
      await accountResponse.json();

    if (!accountResponse.ok) {
      console.error(
        "Deriv account lookup failed:",
        accountData
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
              Could Not Read Deriv Account
            </h2>

            <p style="color:#ff6b81;">
              Deriv authorization succeeded,
              but BotForge could not read
              your Deriv account.
            </p>

          </body>
        </html>
      `);
    }

    // ---------------------------------------
    // Find Deriv account
    // ---------------------------------------

    const accounts =
      Array.isArray(accountData.data)
        ? accountData.data
        : accountData.data
          ? [accountData.data]
          : [];

    if (!accounts.length) {
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
              No Deriv Account Found
            </h2>

            <
