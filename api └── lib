import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  "https://yjqgbqekwyqpvtiikghc.supabase.co";

const SUPABASE_SECRET_KEY =
  process.env.supabase_service_role_key;

if (!SUPABASE_SECRET_KEY) {
  throw new Error(
    "supabase_service_role_key is missing from Vercel."
  );
}

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
