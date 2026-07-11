"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;

let browserClient: BrowserSupabaseClient | null = null;

export function createSupabaseBrowserClient() {
  const config = getSupabasePublicConfig();

  if (!config) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(config.url, config.anonKey);
  }

  return browserClient;
}
