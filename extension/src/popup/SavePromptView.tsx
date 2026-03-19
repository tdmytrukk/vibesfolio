import { useState } from "react";
import { supabase } from "../lib/supabase";

const APP_URL = import.meta.env.VITE_APP_URL as string;

interface Props {
  initialContent: string;
  userId: string;
}

const inputStyle: React.CSSProperties = {
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
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 500,
  marginBottom: "0.375rem",
  color: "hsl(240 10% 10%)",
};

export default function SavePromptView({ initialContent, userId }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(initialContent);
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const parsedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);

    const { error: insertError } = await supabase.from("prompts").insert({
      title: title.trim(),
      content: content.trim(),
      tags: parsedTags,
      user_id: userId,
    });

    if (insertError) {
      setError("Failed to save. Please try again.");
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
  };

  if (saved) {
    return (
      <div style={{ textAlign: "center", padding: "1.5rem 0 0.5rem" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "hsl(160 40% 90%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 0.75rem",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(160 50% 35%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="font-heading" style={{ fontSize: "1.125rem", fontWeight: 400, marginBottom: "0.25rem", color: "hsl(240 10% 10%)" }}>
          Saved to Library!
        </h2>
        <p style={{ fontSize: "0.75rem", color: "hsl(240 5% 46%)", marginBottom: "1.25rem" }}>
          Your prompt has been saved successfully.
        </p>
        <a
          href={`${APP_URL}/prompts`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
            width: "100%", padding: "0.625rem 1rem",
            background: "#fff", color: "hsl(240 10% 10%)",
            border: "1px solid hsl(260 15% 90%)", borderRadius: "9999px",
            fontFamily: "inherit", fontSize: "0.875rem", fontWeight: 500,
            textDecoration: "none", marginBottom: "0.75rem",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Open in Vibesfolio
        </a>
        <button
          onClick={() => { setSaved(false); setTitle(""); setContent(""); setTags(""); }}
          style={{ background: "none", border: "none", fontSize: "0.75rem", color: "hsl(240 5% 46%)", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}
        >
          Save another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {initialContent && (
        <p style={{ fontSize: "0.75rem", color: "hsl(240 5% 46%)", background: "hsl(260 15% 93%)", borderRadius: "0.75rem", padding: "0.5rem 0.875rem" }}>
          Pre-filled from your selection
        </p>
      )}

      <div>
        <label style={labelStyle}>Prompt title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={inputStyle}
          placeholder="e.g. Landing page hero copy"
        />
      </div>

      <div>
        <label style={labelStyle}>Prompt content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={5}
          style={{ ...inputStyle, resize: "vertical", minHeight: 80, lineHeight: 1.5 }}
          placeholder="Paste your prompt here…"
        />
      </div>

      <div>
        <label style={labelStyle}>
          Tags <span style={{ fontWeight: 400, color: "hsl(240 5% 46%)" }}>(comma-separated)</span>
        </label>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} style={inputStyle} placeholder="copywriting, landing, hero" />
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
          marginTop: "0.25rem",
        }}
      >
        {loading ? "Saving..." : "Save to Library"}
      </button>
    </form>
  );
}
