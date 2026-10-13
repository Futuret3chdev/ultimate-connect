"use client";

import { useState, useEffect } from "react";
import { PLATFORMS } from "@/lib/platforms";

export default function Home() {
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conn = params.get("connected");
    if (conn) setMessage(`Successfully connected ${conn}`);
    const err = params.get("error");
    if (err) setMessage(`Error: ${err}`);
  }, []);

  const connect = (platform: string) => {
    window.location.href = `/api/auth/${platform}`;
  };

  const post = async () => {
    if (!content.trim()) return setMessage("Enter content");
    if (!selected.length) return setMessage("Select platforms");
    setLoading(true);
    setMessage("");
    setResults(null);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platforms: selected }),
      });
      const data = await res.json();
      setResults(data.results);
      const successes = Object.values(data.results || {}).filter((r: any) => r.success).length;
      setMessage(successes ? `Posted successfully to ${successes} platform(s)` : "Posting completed with errors – see details");
    } catch (e) {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  const adapt = async (platform: string) => {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, platform }),
    });
    const data = await res.json();
    if (data.adapted) setContent(data.adapted);
    else setMessage(data.error || "Adaptation failed");
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">UltimateConnect</h1>
      <p className="text-slate-400 mb-6">Real cross-posting. Connect your accounts, then post for real.</p>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-slate-800 text-sm">{message}</div>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Connect Accounts</h2>
        <div className="flex flex-wrap gap-3">
          {Object.keys(PLATFORMS).map((id) => (
            <button
              key={id}
              onClick={() => connect(id)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
            >
              Connect {PLATFORMS[id as keyof typeof PLATFORMS].name}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Requires developer app credentials set as environment variables on Vercel.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Ultimate Post</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 mb-3"
          placeholder="Write your post..."
        />
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.keys(PLATFORMS).map((id) => (
            <label key={id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(id)}
                onChange={() =>
                  setSelected((s) =>
                    s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
                  )
                }
              />
              {PLATFORMS[id as keyof typeof PLATFORMS].name}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={post}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-semibold disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post for Real"}
          </button>
          <button
            onClick={() => adapt("twitter")}
            className="px-4 py-3 rounded-xl bg-slate-700 text-sm"
          >
            AI Adapt for X
          </button>
        </div>
      </section>

      {results && (
        <section className="mt-6">
          <h3 className="font-semibold mb-2">Results</h3>
          <pre className="bg-slate-900 p-4 rounded-xl text-xs overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </section>
      )}

      <section className="mt-10 text-sm text-slate-400">
        <h3 className="font-semibold text-white mb-2">Setup for Real Use</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Create developer apps on X, LinkedIn, Meta (Facebook).</li>
          <li>Set Client ID / Secret as env vars in Vercel (TWITTER_CLIENT_ID, etc.).</li>
          <li>Set NEXTAUTH_SECRET and NEXTAUTH_URL.</li>
          <li>For Instagram posting, connect a Facebook Page with Instagram Business account.</li>
          <li>Optional: OPENAI_API_KEY or XAI_API_KEY for AI adaptation.</li>
          <li>For production scheduling and multi-user, add Vercel Postgres + Prisma.</li>
        </ol>
        <p className="mt-4">PWA: Add to Home Screen on mobile for app-like experience. Capacitor can wrap this for native stores.</p>
      </section>
    </main>
  );
}
