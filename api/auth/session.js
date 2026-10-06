import {
  supabaseAdmin
} from "../lib/supabase.js";

import {
  getCurrentUser
} from "../lib/session.js";

export default async function handler(
  req,
  res
) {
  try {
    const session =
      await getCurrentUser(req);

    /*
     * No BotForge session cookie
     */
    if (!session) {
      return res.status(200).json({
        authenticated: false
      });
    }

    /*
     * Get the BotForge user's profile
     */
    const {
      data: profile,
      error: profileError
    } =
      await supabaseAdmin
        .from("profiles")
        .select(
          "id,email,full_name,role,created_at"
        )
        .eq(
          "id",
          session.userId
        )
        .maybeSingle();

    if (profileError) {
      console.error(
        "BotForge profile error:",
        profileError
      );

      return res.status(500).json({
        authenticated: false,
        error:
          "Unable to load user profile."
      });
    }

    /*
     * Check whether the user has already
     * connected a Deriv account.
     */
    const {
      data: derivConnection,
      error: derivError
    } =
      await supabaseAdmin
        .from("deriv_connections")
        .select(
          "deriv_account_id,account_type,connected"
        )
        .eq(
          "user_id",
          session.userId
        )
        .maybeSingle();

    if (derivError) {
      console.error(
        "Deriv connection lookup error:",
        derivError
      );
    }

    /*
     * Return the authenticated BotForge user.
     */
    return res.status(200).json({
      authenticated: true,

      user: {
        id:
          profile?.id ||
          session.userId,

        email:
          profile?.email ||
          null,

        full_name:
          profile?.full_name ||
          null,

        role:
          profile?.role ||
          "user",

        created_at:
          profile?.created_at ||
          null
      },

      deriv: {
        connected:
          derivConnection?.connected ||
          false,

        account_id:
          derivConnection?.deriv_account_id ||
          null,

        account_type:
          derivConnection?.account_type ||
          null
      },

      session: {
        expires_at:
          session.expiresAt
      }
    });

  } catch (error) {
    console.error(
      "BotForge session error:",
      error
    );

    return res.status(500).json({
      authenticated: false,
      error:
        "Session service unavailable."
    });
  }
          }
