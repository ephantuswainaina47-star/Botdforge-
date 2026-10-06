import {
  supabaseAdmin
} from "../lib/supabase.js";

import {
  createSession
} from "../lib/session.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed."
      });
    }

    const {
      access_token
    } = req.body || {};

    if (!access_token) {
      return res.status(400).json({
        error: "Access token is required."
      });
    }

    /*
     * Verify the Supabase access token.
     */
    const {
      data,
      error
    } =
      await supabaseAdmin.auth.getUser(
        access_token
      );

    if (error || !data?.user) {
      console.error(
        "Supabase authentication error:",
        error
      );

      return res.status(401).json({
        error: "Invalid authentication session."
      });
    }

    const user = data.user;

    /*
     * Make sure the BotForge profile exists.
     */
    const {
      data: profile,
      error: profileError
    } =
      await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email || null,
            full_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              null
          },
          {
            onConflict: "id"
          }
        )
        .select(
          "id,email,full_name,role,created_at"
        )
        .single();

    if (profileError) {
      console.error(
        "Profile creation error:",
        profileError
      );

      return res.status(500).json({
        error:
          "Unable to create BotForge profile."
      });
    }

    /*
     * Create the secure BotForge session.
     */
    await createSession(
      user.id,
      res
    );

    return res.status(200).json({
      authenticated: true,

      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role || "user"
      }
    });

  } catch (error) {
    console.error(
      "BotForge login error:",
      error
    );

    return res.status(500).json({
      error:
        "Unable to create BotForge session."
    });
  }
      }
