const fallbackAppUrl = "http://localhost:3000";

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || fallbackAppUrl,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  sycamoreApiToken: process.env.SYCAMORE_API_TOKEN || "",
  sycamoreApiBaseUrl: process.env.SYCAMORE_API_BASE_URL || "",
  resendApiKey: process.env.RESEND_API_KEY || ""
};

export function hasSupabaseEnv() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasAuthEnv() {
  return hasSupabaseEnv();
}

export function isMockMode() {
  return !hasSupabaseEnv();
}
