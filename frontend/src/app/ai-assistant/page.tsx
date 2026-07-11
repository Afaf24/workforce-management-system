"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api-client";
import type { ConversationHistory } from "@/types";
import { Bot, User, Send } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm your AI HR Assistant. Ask me about leave balances, attendance, or HR policies." },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<ConversationHistory[]>("/api/v1/ai-assistant/history?take=10").then((history) => {
      if (history.length === 0) return;
      const restored: ChatMessage[] = [];
      [...history].reverse().forEach((h) => {
        restored.push({ role: "user", content: h.question });
        restored.push({ role: "assistant", content: h.answer });
      });
      setMessages((prev) => [prev[0], ...restored]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const question = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const result = await api.post<{ answer: string }>("/api/v1/ai-assistant/ask", { question });
      setMessages((prev) => [...prev, { role: "assistant", content: result.answer }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "The assistant is unavailable right now.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <ProtectedShell>
      <h1 className="mb-2 text-2xl font-bold">AI HR Assistant</h1>
      <p className="mb-6 text-muted-foreground">
        Ask about your leave balance, attendance, or general HR policies.
      </p>

      <Card className="flex h-[600px] max-w-3xl flex-col">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {isSending && <p className="text-sm text-muted-foreground">Assistant is typing...</p>}
        </div>

        {error && <p className="px-6 text-sm text-destructive">{error}</p>}

        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-4">
          <Input
            placeholder="e.g. How many annual leave days do I have left?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </ProtectedShell>
  );
}
