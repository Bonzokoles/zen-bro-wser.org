import React, { useState, useEffect, useRef } from "react";

/**
 * Minimalny Reactowy widget czatu do użycia w Astro.
 * Komunikuje się z backendem FastAPI (endpoint /api/chat or /api/stream).
 * Nie używa żadnych zewnętrznych API.
 */

export default function ChatWidget({ apiBaseUrl = "/api" }) {
  const [messages, setMessages] = useState([
    { id: 0, role: "system", text: "Witaj! Jestem lokalnym chatbotem." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Możesz wybrać stream lub nie. Tutaj przykład fetch z oczekiwaniem na pełną odpowiedź.
      const res = await fetch(`${apiBaseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const botMsg = { id: Date.now() + 1, role: "assistant", text: data.text };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      const errMsg = { id: Date.now(), role: "assistant", text: "Błąd: " + err.message };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Opcjonalnie: obsługa klawisza Enter
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, width: 360 }}>
      <div style={{ maxHeight: 320, overflowY: "auto", marginBottom: 8 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>{m.role}</div>
            <div style={{ background: m.role === "user" ? "#e6f3ff" : "#f3f3f3", padding: 8, borderRadius: 6 }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        rows={3}
        style={{ width: "100%", marginBottom: 8 }}
        placeholder="Napisz wiadomość..."
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={sendMessage} disabled={loading} style={{ flex: 1 }}>
          {loading ? "Wysyłanie..." : "Wyślij"}
        </button>
      </div>
    </div>
  );
}