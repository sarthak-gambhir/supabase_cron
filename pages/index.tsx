import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const runHeartbeat = async () => {
    setLoading(true);
    setMessage("");
    setResult(null);
    try {
      const res = await fetch("/api/heartbeat");
      const json = await res.json();
      if (res.ok) {
        setMessage(`✅ Success: created_at = ${json.created_at}`);
      } else {
        setMessage(`❌ Error: ${json.error}`);
      }
      setResult(res.ok);
    } catch (err: unknown) {
      setMessage(`❌ Exception: ${(err as Error).message}`);
      setResult(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "2rem",
        height: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: "4rem",
          textAlign: "center",
        }}
      >
        Supabase Heartbeat Test
      </h1>
      <button
        onClick={runHeartbeat}
        disabled={loading}
        style={{ padding: "1rem 2rem", fontSize: "1.25rem" }}
      >
        {loading ? "Running..." : "Run Heartbeat"}
      </button>

      {result && (
        <p
          style={{
            marginTop: "1rem",
            textAlign: "center",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            width: "80%",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
