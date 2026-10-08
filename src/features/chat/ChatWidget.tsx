import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Trash2, Copy, RotateCcw, Send, Bot } from 'lucide-react';
import { useT } from '@/i18n';
import { streamChat } from './stream';
import type { ChatSource } from '@shared/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: ChatSource[];
  error?: boolean;
}

const newId = () => crypto.randomUUID();

export default function ChatWidget() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Command palette bisa membuka chat lewat event global
  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener('open-chat', openChat);
    return () => window.removeEventListener('open-chat', openChat);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(question: string, history: Message[] = messages) {
    if (streaming || question.trim().length < 2) return;

    const assistantId = newId();
    setMessages([
      ...history,
      { id: newId(), role: 'user', text: question },
      { id: assistantId, role: 'assistant', text: '' },
    ]);
    setInput('');
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const update = (fn: (m: Message) => Message) =>
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? fn(m) : m)));

    try {
      await streamChat(
        question,
        (event) => {
          if (event.type === 'sources') update((m) => ({ ...m, sources: event.sources }));
          if (event.type === 'token') update((m) => ({ ...m, text: m.text + event.text }));
          if (event.type === 'error') update((m) => ({ ...m, text: event.message, error: true }));
        },
        controller.signal,
      );
    } catch {
      if (!controller.signal.aborted) {
        update((m) => ({ ...m, text: t('chat.unavailable'), error: true }));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function regenerate() {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    const idx = messages.findIndex((m) => m.id === lastUser.id);
    send(lastUser.text, messages.slice(0, idx));
  }

  const suggestions = [t('chat.s1'), t('chat.s2'), t('chat.s3'), t('chat.s4')];

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-105"
        aria-label={t('chat.title')}
        aria-expanded={open}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      {open && (
        <section
          role="dialog"
          aria-label={t('chat.title')}
          className="fixed bottom-24 right-4 z-40 flex h-[32rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:right-5"
        >
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <div className="flex items-center gap-2 font-semibold">
              <Bot className="size-4 text-brand-600" aria-hidden /> {t('chat.title')}
            </div>
            <button
              onClick={() => setMessages([])}
              disabled={messages.length === 0 || streaming}
              className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
              aria-label={t('chat.clear')}
              title={t('chat.clear')}
            >
              <Trash2 className="size-4" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-slate-500">{t('chat.empty')}</p>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-brand-600 text-white'
                      : m.error
                        ? 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                        : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {m.role === 'assistant' && !m.text && streaming && i === messages.length - 1 ? (
                    <span className="inline-flex gap-1" aria-label="Typing">
                      <span className="size-1.5 animate-bounce rounded-full bg-slate-400" />
                      <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                    </span>
                  ) : (
                    m.text
                  )}

                  {m.role === 'assistant' && m.text && !streaming && (
                    <div className="mt-2 flex gap-2 text-xs text-slate-500">
                      <button onClick={() => navigator.clipboard.writeText(m.text)} className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                        <Copy className="size-3" /> {t('chat.copy')}
                      </button>
                      {i === messages.length - 1 && (
                        <button onClick={regenerate} className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                          <RotateCcw className="size-3" /> {t('chat.regenerate')}
                        </button>
                      )}
                    </div>
                  )}

                  {m.sources && m.sources.length > 0 && !streaming && (
                    <p className="mt-2 text-xs text-slate-500">
                      Sumber: {m.sources.map((s) => s.title).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-700"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder={t('chat.placeholder')}
              aria-label={t('chat.placeholder')}
              className="flex-1 rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600"
            />
            <button
              type="submit"
              disabled={streaming || input.trim().length < 2}
              className="rounded-lg bg-brand-600 p-2 text-white disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="size-4" />
            </button>
          </form>
        </section>
      )}
    </>
  );
}