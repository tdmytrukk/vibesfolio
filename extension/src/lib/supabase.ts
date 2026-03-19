import { createClient } from "@supabase/supabase-js";

// chrome.storage.local is async and uses get/set/remove.
// Supabase expects a synchronous localStorage-like interface (getItem/setItem/removeItem).
// We bridge the two with an in-memory cache that stays in sync with chrome.storage.local.
const memCache: Record<string, string> = {};

// Resolves once the cache is hydrated — callers must await this before reading session
export const storageReady = new Promise<void>((resolve) => {
  chrome.storage.local.get(null, (items) => {
    Object.assign(memCache, items);
    resolve();
  });
});

const storageAdapter = {
  getItem: (key: string): string | null => memCache[key] ?? null,
  setItem: (key: string, value: string): void => {
    memCache[key] = value;
    chrome.storage.local.set({ [key]: value });
  },
  removeItem: (key: string): void => {
    delete memCache[key];
    chrome.storage.local.remove([key]);
  },
};

export const supabase = createClient(
  "https://wvlayumwjzdppgkgminv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bGF5dW13anpkcHBna2dtaW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNjAyOTksImV4cCI6MjA4NzYzNjI5OX0.IWsuZpCGWOs0hH_rJTzSHsem8afjOir5hs4VkdVxyLA",
  {
    auth: {
      storage: storageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  }
);
