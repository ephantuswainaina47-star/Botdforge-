import {
  supabaseAdmin
} from "./supabase.js";

import {
  randomToken,
  hashToken
} from "./crypto.js";

const COOKIE_NAME =
  "botforge_session";

const SESSION_DAYS = 30;

export async function createSession(
  userId,
  res
) {
  const token = randomToken();

  const sessionHash =
    hashToken(token);

  const expiresAt =
    new Date(
      Date.now() +
      SESSION_DAYS *
      24 *
      60 *
      60 *
      1000
    );

  const { error } =
    await supabaseAdmin
      .from("botforge_sessions")
      .insert({
        user_id: userId,
        session_hash: sessionHash,
        expires_at:
          expiresAt.toISOString()
      });

  if (error) {
    throw error;
  }

  res.setHeader(
    "Set-Cookie",
    [
      `${COOKIE_NAME}=${encodeURIComponent(token)}`,
      "Path=/",
      "HttpOnly",
      "Secure",
      "SameSite=Lax",
      `Max-Age=${SESSION_DAYS * 24 * 60 * 60}`
    ].join("; ")
  );

  return token;
}

export function getSessionToken(req) {
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

  return cookies[COOKIE_NAME] || null;
}

export async function getCurrentUser(req) {
  const token =
    getSessionToken(req);

  if (!token) {
    return null;
  }

  const sessionHash =
    hashToken(token);

  const { data, error } =
    await supabaseAdmin
      .from("botforge_sessions")
      .select(
        "id,user_id,expires_at"
      )
      .eq(
        "session_hash",
        sessionHash
      )
      .maybeSingle();

  if (error || !data) {
    return null;
  }

  if (
    new Date(data.expires_at).getTime()
    <= Date.now()
  ) {
    await supabaseAdmin
      .from("botforge_sessions")
      .delete()
      .eq("id", data.id);

    return null;
  }

  return {
    sessionId: data.id,
    userId: data.user_id,
    expiresAt: data.expires_at
  };
}

export async function destroySession(
  req,
  res
) {
  const token =
    getSessionToken(req);

  if (token) {
    const sessionHash =
      hashToken(token);

    await supabaseAdmin
      .from("botforge_sessions")
      .delete()
      .eq(
        "session_hash",
        sessionHash
      );
  }

  res.setHeader(
    "Set-Cookie",
    [
      `${COOKIE_NAME}=`,
      "Path=/",
      "HttpOnly",
      "Secure",
      "SameSite=Lax",
      "Max-Age=0"
    ].join("; ")
  );
        }
