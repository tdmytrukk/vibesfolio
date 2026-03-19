// Runs on vibesfolio.volynska.dev and vibesfolio.lovable.app
// Reads the Supabase session from localStorage and sends it to the extension

function findAndStoreSession(): boolean {
  try {
    const raw = localStorage.getItem("vibesfolio_extension_session");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (parsed?.access_token && parsed?.refresh_token) {
      chrome.storage.local.set({ vibesfolio_pending_session: parsed });
      return true;
    }
  } catch {
    // localStorage not accessible or parse error — ignore
  }
  return false;
}

// Keep re-storing the session every 3 seconds as long as the page is open.
// The popup consumes vibesfolio_pending_session after reading it, so we need
// to keep refreshing it so the next popup open can find it.
findAndStoreSession();
setInterval(findAndStoreSession, 3000);

// Also catch logins/logouts happening in other tabs
window.addEventListener("storage", findAndStoreSession);
