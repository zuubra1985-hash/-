import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Smartphone, Monitor, Copy, Check, BookmarkPlus, Bot, User } from 'lucide-react';
import { ChatMessage, AgentConfig } from '../types/agent';

interface AgentChatProps {
  messages: ChatMessage[];
  config: AgentConfig;
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
}

export const AgentChat: React.FC<AgentChatProps> = ({
  messages,
  config,
  onSendMessage,
  isLoading
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const text = inputText.trim();
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { label: '🎯 План на день', prompt: 'Помоги мне составить эффективный план на сегодня с учетом приоритетов.' },
    { label: '🧠 Что ты помнишь?', prompt: 'Расскажи подробно, что ты уже помнишь обо мне из нашей памяти?' },
    { label: '💡 Идеи для проекта', prompt: 'Предложи 3 свежих и оригинальных идеи для личного проекта или стартапа.' },
    { label: '📌 Запомни факт', prompt: 'Запомни, что ' }
  ];

  return (
    <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-3 sm:p-4 md:p-6 overflow-hidden">
      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-4 sm:space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isTelegram = msg.source === 'telegram';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3.5 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 text-sm shadow-sm ${
                  isUser
                    ? 'bg-slate-800 border border-slate-700 text-slate-200'
                    : 'bg-gradient-to-tr from-pink-500/20 to-purple-600/30 border border-pink-500/30 text-pink-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <span>{config.avatar || '✨'}</span>}
              </div>

              {/* Message Bubble Container */}
              <div className={`flex flex-col max-w-[88%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Source & Timestamp Header */}
                <div className="flex items-center gap-1.5 px-1 mb-1 text-[11px] text-slate-500 font-mono">
                  <span className="font-semibold text-slate-400">
                    {isUser ? 'Вы' : config.name}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {isTelegram ? (
                      <span className="text-sky-400 flex items-center gap-0.5">
                        <Smartphone className="w-3 h-3" />
                        <span>Telegram</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-0.5">
                        <Monitor className="w-3 h-3" />
                        <span>Веб</span>
                      </span>
                    )}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Bubble */}
                <div
                  className={`group relative rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
                    isUser
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}

                  {/* Copy Button for Agent Messages */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs"
                      title="Скопировать текст"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500/20 to-purple-600/30 border border-pink-500/30 flex items-center justify-center text-sm shrink-0">
              {config.avatar || '✨'}
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 text-slate-400 text-sm flex items-center gap-2">
              <span className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
              </span>
              <span className="text-xs text-slate-400 font-medium">{config.name} думает...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="pt-3 pb-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {quickPrompts.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              setInputText(item.prompt);
              textareaRef.current?.focus();
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="relative mt-1">
        <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-pink-500/50 focus-within:ring-1 focus-within:ring-pink-500/30 transition-all shadow-lg overflow-hidden flex items-end">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Напиши сообщение для ${config.name}... (или пиши прямо в Telegram боту @Milachudila_bot)`}
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-sm sm:text-base px-4 py-3.5 focus:outline-none resize-none max-h-40"
          />

          <div className="p-2 flex items-center gap-1 shrink-0">
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shadow-pink-500/20 active:scale-95"
              title="Отправить (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-slate-500">
          <span>Нажмите Enter для отправки, Shift+Enter для новой строки</span>
          <span className="text-emerald-400/80 font-medium">⚡ Gemini AI + Telegram Live</span>
        </div>
      </form>
    </div>
  );
};
