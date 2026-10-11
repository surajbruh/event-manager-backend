import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

for (const k of ["SUPABASE_URL", "SUPABASE_ANON_KEY"]) {
  if (!process.env[k]) {
    console.error(`Missing ${k}. Copy .env.example to .env first.`);
    process.exit(1);
  }
}
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
