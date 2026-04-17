'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Sparkles, Check, X } from 'lucide-react';

type MessageKind = 'agent' | 'user' | 'progress';

interface ChatMessage {
  id: string;
  kind: MessageKind;
  text: string;
  withActions?: boolean;
  answered?: boolean;
}

/* ================= MAIN COMPONENT ================= */

export default function AgentHelperPanel() {
  const t = useTranslations('workspace.agent');

  /* ===== RESIZE STATE ===== */
  const [panelWidth, setPanelWidth] = useState(380);
  const isResizing = useRef(false);

  const startResize = () => {
    isResizing.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  const stopResize = () => {
    isResizing.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  const resize = (e: MouseEvent) => {
    if (!isResizing.current) return;

    const min = 300;
    const max = 500;

    const newWidth = window.innerWidth - e.clientX;

    if (newWidth < min) setPanelWidth(min);
    else if (newWidth > max) setPanelWidth(max);
    else setPanelWidth(newWidth);
  };

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize);

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResize);
    };
  }, []);

  /* ===== MESSAGES STATE ===== */

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', kind: 'agent', text: t('greeting') },
    { id: '2', kind: 'agent', text: t('askScope') },
    { id: '3', kind: 'user', text: t('userChoice') },
    {
      id: '4',
      kind: 'agent',
      text: t('confirmStart'),
      withActions: true,
    },
    { id: '6', kind: 'progress', text: t('inProgress') },
    { id: '7', kind: 'agent', text: t('doneSummary') },
  ]);

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserAtBottom = useRef(true);

  /* ===== AUTO SCROLL ===== */

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const threshold = 80;

    isUserAtBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (isUserAtBottom.current) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  /* ===== LOGIC ===== */

  const pushMessage = (msg: Omit<ChatMessage, 'id'>) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: crypto.randomUUID() },
    ]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    pushMessage({ kind: 'user', text: input.trim() });
    setInput('');
  };

  const handleValidation = (id: string, accepted: boolean) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, answered: true } : msg
      )
    );

    pushMessage({
      kind: 'user',
      text: accepted ? t('yes') : t('no'),
    });
  };

  return (
    <aside
      style={{ width: panelWidth }}
      className="flex flex-col h-full border-l border-theme bg-[var(--bg-primary)] relative transition-all duration-75"
    >
      {/* ================= RESIZE HANDLE ================= */}
      <div
        onMouseDown={startResize}
        className="absolute left-0 top-0 h-full w-1 cursor-ew-resize hover:bg-primary/30 transition"
      />

      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-3 px-5 py-4 h-16 border-b border-theme">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles size={17} className="text-primary" />
        </div>

        <div>
          <div className="text-sm font-semibold text-heading">
            {t('title')}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {t('subtitle')}
          </div>
        </div>
      </div>

      {/* ================= MESSAGES ================= */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-5 py-4"
      >
        <div className="flex flex-col space-y-4 min-h-full justify-end">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              onValidate={handleValidation}
              yesLabel={t('yes')}
              noLabel={t('no')}
            />
          ))}
        </div>
      </div>

      {/* ================= INPUT ================= */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-theme">
        <div className="flex items-center gap-2 rounded-2xl border border-theme px-3 py-2 focus-within:border-primary transition">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('inputPlaceholder')}
            className="flex-1 bg-transparent text-sm outline-none text-heading placeholder:text-[var(--text-tertiary)]"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-xl disabled:opacity-40 hover:bg-primary-dark transition"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </aside>
  );
}

/* ================= CHAT BUBBLE ================= */

interface ChatBubbleProps {
  message: ChatMessage;
  onValidate: (id: string, accepted: boolean) => void;
  yesLabel: string;
  noLabel: string;
}

function ChatBubble({
  message,
  onValidate,
  yesLabel,
  noLabel,
}: ChatBubbleProps) {
  if (message.kind === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-4 py-2 rounded-2xl rounded-tr-sm bg-primary text-white text-sm shadow-sm">
          {message.text}
        </div>
      </div>
    );
  }

  if (message.kind === 'progress') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-theme text-xs text-body bg-white/40 backdrop-blur">
        <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        {message.text}
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* avatar */}
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-1">
        <Sparkles size={13} className="text-primary" />
      </div>

      <div className="max-w-[85%] space-y-2">
        {/* message */}
        <div className="px-4 py-2 rounded-2xl rounded-tl-sm text-sm bg-[var(--bg-secondary)] text-heading shadow-sm">
          {message.text}
        </div>

        {/* actions */}
        {message.withActions && !message.answered && (
          <div className="flex gap-2">
            <button
              onClick={() => onValidate(message.id, true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-green-500/30 text-green-600 bg-green-500/10 hover:bg-green-500/20 transition"
            >
              <Check size={12} />
              {yesLabel}
            </button>

            <button
              onClick={() => onValidate(message.id, false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-red-500/30 text-red-600 bg-red-500/10 hover:bg-red-500/20 transition"
            >
              <X size={12} />
              {noLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}