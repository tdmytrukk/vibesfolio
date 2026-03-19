import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

const APP_URL = import.meta.env.VITE_APP_URL as string;

interface Props {
  onLogin: (session: Session) => void;
}

export default function LoginView({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data.session) onLogin(data.session);
    setLoading(false);
  };

  const handleOpenWebApp = () => {
    chrome.tabs.create({ url: `${APP_URL}/auth` });
  };



  const inputStyle = {
    width: "100%",
    padding: "0.625rem 0.875rem",
    border: "1px solid hsl(260 15% 90%)",
    borderRadius: "0.75rem",
    background: "#fff",
    fontFamily: "inherit",
    fontSize: "0.875rem",
    outline: "none",
    color: "hsl(240 10% 10%)",
    transition: "border-color 0.15s",
  } as React.CSSProperties;

  return (
    <div className="card-glass" style={{ width: 380, padding: "1.5rem" }}>
      <h1 className="font-heading" style={{ fontSize: "1.375rem", fontWeight: 400, marginBottom: "0.375rem", color: "hsl(240 10% 10%)" }}>
        Vibesfolio
      </h1>
      <p style={{ fontSize: "0.75rem", color: "hsl(240 5% 46%)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
        Sign in to save prompts and resources.
      </p>

      <button
        onClick={handleOpenWebApp}
        style={{
          width: "100%", padding: "0.625rem 1rem",
          background: "hsl(240 8% 12%)", color: "#fff",
          border: "none", borderRadius: "9999px",
          fontFamily: "inherit", fontSize: "0.875rem", fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Sign in via Vibesfolio
      </button>

      <div style={{ display: "flex", alignItems: "center", margin: "1.25rem 0", gap: "0.75rem" }}>
        <div style={{ flex: 1, height: 1, background: "hsl(260 15% 90%)" }} />
        <span style={{ fontSize: "0.75rem", color: "hsl(240 5% 46%)" }}>or use email</span>
        <div style={{ flex: 1, height: 1, background: "hsl(260 15% 90%)" }} />
      </div>

      <form onSubmit={handleEmailSignIn} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 500, marginBottom: "0.375rem", color: "hsl(240 10% 10%)" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 500, marginBottom: "0.375rem", color: "hsl(240 10% 10%)" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
            placeholder="••••••••"
          />
        </div>

        {error && <p style={{ fontSize: "0.75rem", color: "hsl(0 72% 55%)" }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", padding: "0.625rem 1rem",
            background: "hsl(240 8% 12%)", color: "#fff",
            border: "none", borderRadius: "9999px",
            fontFamily: "inherit", fontSize: "0.875rem", fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? "Signing in..." : "Sign in with email"}
        </button>
      </form>

      <p style={{ fontSize: "0.75rem", color: "hsl(240 5% 46%)", textAlign: "center", marginTop: "1rem" }}>
        Don't have an account?{" "}
        <button
          onClick={() => chrome.tabs.create({ url: APP_URL })}
          style={{ background: "none", border: "none", color: "hsl(240 5% 46%)", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit" }}
        >
          Sign up on vibesfolio.app
        </button>
      </p>

    </div>
  );
}
