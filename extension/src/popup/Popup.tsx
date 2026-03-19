import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, storageReady } from "../lib/supabase";
import LoginView from "./LoginView";
import SaveResourceView from "./SaveResourceView";
import SavePromptView from "./SavePromptView";

type ActiveTab = "resource" | "prompt";

export interface CurrentTab {
  url: string;
  title: string;
}

export default function Popup() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("resource");
  const [currentTab, setCurrentTab] = useState<CurrentTab | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState("");

  // Auth
  useEffect(() => {
    async function bootstrapFromWebsite(): Promise<boolean> {
      return new Promise((resolve) => {
        chrome.storage.local.get(["vibesfolio_pending_session"], async (result) => {
          if (!result.vibesfolio_pending_session) return resolve(false);
          // Remove immediately so we never re-consume the same token
          chrome.storage.local.remove(["vibesfolio_pending_session"]);
          const { access_token, refresh_token } = result.vibesfolio_pending_session;
          // Use setSession — uses access_token if still valid, avoids burning refresh token
          const { data } = await supabase.auth.setSession({ access_token, refresh_token });
          if (data.session) {
            setSession(data.session);
            setLoading(false);
            return resolve(true);
          }
          resolve(false);
        });
      });
    }

    async function initAuth() {
      await storageReady;

      // 1. Try extension's own persisted session first — never touch website tokens if we have one
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        setLoading(false);
        return;
      }

      // 2. No extension session — bootstrap once from website token
      if (await bootstrapFromWebsite()) return;

      setLoading(false);

      // 3. Poll briefly in case content script delivers the token shortly after
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        if (await bootstrapFromWebsite() || attempts >= 30) {
          clearInterval(interval);
        }
      }, 1000);
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  // Current tab info + pending prompt from context menu
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab) setCurrentTab({ url: tab.url ?? "", title: tab.title ?? "" });
    });

    chrome.storage.session.get(["pendingPrompt"], (result) => {
      if (result.pendingPrompt) {
        setPendingPrompt(result.pendingPrompt as string);
        setActiveTab("prompt");
        chrome.storage.session.remove(["pendingPrompt"]);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="card-glass" style={{ width: 380, padding: "3rem 1.5rem", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <div style={{
            width: 28, height: 28,
            border: "3px solid hsl(260 15% 90%)",
            borderTopColor: "hsl(240 8% 12%)",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }} />
        </div>
        <h1 className="font-heading" style={{ fontSize: "1.375rem", fontWeight: 400, marginBottom: "0.25rem", color: "hsl(240 10% 10%)" }}>
          Vibesfolio
        </h1>
        <p style={{ fontSize: "0.75rem", color: "hsl(240 5% 46%)" }}>Signing you in…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session) {
    return <LoginView onLogin={setSession} />;
  }

  const tabBorderStyle = {
    borderBottom: "2px solid hsl(260 15% 90%)",
    display: "flex",
    marginBottom: "1.25rem",
  };

  return (
    <div className="card-glass" style={{ width: 380, padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid hsl(260 15% 90%)" }}>
        <h1 className="font-heading" style={{ fontSize: "1.375rem", fontWeight: 400, color: "hsl(240 10% 10%)" }}>
          Vibesfolio
        </h1>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{ background: "none", border: "none", fontSize: "0.8125rem", color: "hsl(240 5% 46%)", cursor: "pointer", fontFamily: "inherit" }}
        >
          Sign out
        </button>
      </div>

      {/* Tabs */}
      <div style={tabBorderStyle}>
        {(["resource", "prompt"] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: "0.625rem 0", textAlign: "center",
              fontSize: "0.875rem", fontWeight: 600,
              color: activeTab === tab ? "hsl(240 10% 10%)" : "hsl(240 5% 46%)",
              border: "none", background: "none", cursor: "pointer",
              position: "relative", fontFamily: "inherit",
              borderBottom: activeTab === tab ? "2px solid hsl(240 8% 12%)" : "2px solid transparent",
              marginBottom: -2,
              transition: "color 0.15s",
            }}
          >
            {tab === "resource" ? "Save Resource" : "Save Prompt"}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "resource" ? (
        <SaveResourceView currentTab={currentTab} userId={session.user.id} />
      ) : (
        <SavePromptView initialContent={pendingPrompt} userId={session.user.id} />
      )}
    </div>
  );
}
