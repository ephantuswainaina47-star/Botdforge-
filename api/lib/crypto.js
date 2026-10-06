import crypto from "crypto";

const MASTER_SECRET =
  process.env.supabase_service_role_key;

if (!MASTER_SECRET) {
  throw new Error(
    "supabase_service_role_key is missing from Vercel."
  );
}

const ENCRYPTION_KEY =
  crypto
    .createHash("sha256")
    .update(MASTER_SECRET)
    .digest();

export function encrypt(text) {
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    ENCRYPTION_KEY,
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64")
  ].join(".");
}

export function decrypt(payload) {
  const parts = payload.split(".");

  if (parts.length !== 3) {
    throw new Error(
      "Invalid encrypted payload."
    );
  }

  const iv =
    Buffer.from(parts[0], "base64");

  const authTag =
    Buffer.from(parts[1], "base64");

  const encrypted =
    Buffer.from(parts[2], "base64");

  const decipher =
    crypto.createDecipheriv(
      "aes-256-gcm",
      ENCRYPTION_KEY,
      iv
    );

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}

export function randomToken() {
  return crypto
    .randomBytes(48)
    .toString("base64url");
}

export function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}
