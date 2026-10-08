import type { ChatEvent } from "@shared/types";
import { useUiStore } from "@/store/ui";

// EventSource hanya mendukung GET, sedangkan chat perlu mengirim pesan lewat POST.
// Karena itu kita memakai fetch dan membaca ReadableStream secara manual.
export async function streamChat(
  message: string,
  onEvent: (event: ChatEvent) => void,
  signal?: AbortSignal,
) {
  // Bahasa diambil langsung dari store, karena fungsi ini bukan hook
  const lang = useUiStore.getState().locale;

  const res = await fetch("/api/chat", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, lang }),
    signal,
  });

  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? "Asisten AI sedang tidak tersedia");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const messages = buffer.split("\n\n");
    buffer = messages.pop() ?? "";

    for (const raw of messages) {
      const line = raw.replace(/^data: /, "").trim();
      if (line) onEvent(JSON.parse(line) as ChatEvent);
    }
  }
}