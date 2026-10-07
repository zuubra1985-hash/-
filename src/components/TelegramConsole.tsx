import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Bot,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { TelegramMessage, TaskRecord } from '../types/factory';

interface TelegramConsoleProps {
  messages: TelegramMessage[];
  onSendMessage: (text: string, file?: any) => Promise<void>;
  isLoading: boolean;
  onSelectCommand: (cmd: string) => void;
  onOpenTaskDetails?: (taskId: string) => void;
}

export const TelegramConsole: React.FC<TelegramConsoleProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onSelectCommand,
  onOpenTaskDetails
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachedFile) || isLoading) return;

    const textToSend = inputText.trim();
    const fileToSend = attachedFile;

    setInputText('');
    setAttachedFile(null);

    await onSendMessage(textToSend, fileToSend);
  };

  const handleQuickCommand = (cmd: string) => {
    onSelectCommand(cmd);
  };

  const sampleFiles = [
    { name: 'grant_application_2026.pdf', size: '2.4 MB', type: 'application/pdf' },
    { name: 'b2b_supply_agreement.docx', size: '480 KB', type: 'application/vnd.openxmlformats' },
    { name: 'financial_model_pnl.xlsx', size: '1.1 MB', type: 'application/vnd.ms-excel' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] max-w-5xl mx-auto p-4 md:p-6">
      {/* Bot Header Card */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border border-slate-800 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Master Agent (Miu)</h2>
              <a
                href="https://t.me/Milachudila_bot"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
              >
                @Milachudila_bot
              </a>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400">Центральный координатор • Google Gemini 3.8 Flash • Telegram Polling Active</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://t.me/Milachudila_bot"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>📱 Открыть в Telegram</span>
          </a>
        </div>
      </div>

      {/* Quick Command Ribbon */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 border-x border-slate-800 overflow-x-auto text-xs scrollbar-none">
        <span className="text-slate-500 font-mono text-[11px] mr-1 shrink-0">Команды:</span>
        {[
          { label: '/status', cmd: '/status' },
          { label: '/agents', cmd: '/agents' },
          { label: '/memory', cmd: '/memory' },
          { label: '/errors', cmd: '/errors' },
          { label: '/improve grant_reviewer', cmd: '/improve grant_reviewer' },
          { label: '/test grant_reviewer', cmd: '/test grant_reviewer' },
          { label: '/evolve lawyer', cmd: '/evolve lawyer' },
          { label: '/rollback lawyer 1.2', cmd: '/rollback lawyer 1.2' }
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => handleQuickCommand(item.cmd)}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors whitespace-nowrap text-[11px] font-mono shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-5 bg-slate-950/80 border-x border-slate-800 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  isUser
                    ? 'bg-emerald-600/90 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* File Attachment Pill */}
                {msg.attached_file && (
                  <div className="mb-3 flex items-center gap-2.5 px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-xs">
                    <FileText className="w-4 h-4 text-emerald-300 shrink-0" />
                    <div className="truncate flex-1">
                      <p className="font-medium truncate">{msg.attached_file.name}</p>
                      <p className="text-[10px] text-slate-300/80">{msg.attached_file.size}</p>
                    </div>
                  </div>
                )}

                {/* Text Content */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap font-normal">
                  {msg.text}
                </div>

                {/* Progress Card (Section 58) */}
                {msg.progress_card && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                      <span>🧠 AGENT FACTORY PIPELINE</span>
                      <span className="text-emerald-400 font-semibold">{msg.progress_card.status}</span>
                    </div>
                    <div className="space-y-1.5">
                      {msg.progress_card.steps.map((st, i) => (
                        <div key={i} className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-2">
                            <span className="text-slate-600">→</span>
                            <span>{st.name}</span>
                          </span>
                          <span>
                            {st.status === 'done' && <span className="text-emerald-400">✅</span>}
                            {st.status === 'in_progress' && <span className="text-amber-400">🔄</span>}
                            {st.status === 'pending' && <span className="text-slate-600">⏳</span>}
                            {st.status === 'error' && <span className="text-rose-400">❌</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completion Card (Section 58) */}
                {msg.completion_card && (
                  <div className="mt-3 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-emerald-400">
                        {msg.completion_card.agent_name} v{msg.completion_card.version}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-300 tabular-nums">
                        SCORE: {msg.completion_card.score}/100
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 font-mono mb-2">
                      <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-500 block">Замечания</span>
                        <span className="font-semibold text-amber-400">{msg.completion_card.findings_count}</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-500 block">Рекомендации</span>
                        <span className="font-semibold text-emerald-400">{msg.completion_card.recommendations_count}</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-500 block">Регрессия</span>
                        <span className="font-semibold text-emerald-400">{msg.completion_card.regression_status}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inline Action Buttons */}
                {msg.buttons && msg.buttons.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-2">
                    {msg.buttons.map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickCommand(btn.action)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          btn.variant === 'primary'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                            : btn.variant === 'danger'
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <div
                  className={`mt-2 text-[10px] font-mono ${
                    isUser ? 'text-emerald-200/70 text-right' : 'text-slate-500 text-left'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 max-w-xs text-xs font-mono animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Master Agent выполняет оркестрацию...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray & File Upload Simulation */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-b-xl">
        {/* Quick prompt suggestions */}
        <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto scrollbar-none text-[11px]">
          <span className="text-slate-500 text-[10px] shrink-0 font-mono">Примеры:</span>
          {[
            '👋 Привет, что ты умеешь?',
            '🤖 Создай агента по грантам',
            '⚖️ Проверь договор поставки',
            '🧬 Улучши юриста (/improve)',
            '📊 Состояние системы (/status)'
          ].map((promptText) => (
            <button
              key={promptText}
              type="button"
              onClick={() => onSendMessage(promptText)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 whitespace-nowrap transition-colors shrink-0"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Attached File Preview */}
        {attachedFile && (
          <div className="mb-2 flex items-center justify-between px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate text-slate-200">{attachedFile.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">({attachedFile.size})</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-slate-400 hover:text-rose-400 text-xs ml-2"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* File attachment simulator dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Прикрепить файл (PDF, DOCX, XLSX)"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex flex-col bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-xl z-20 w-64 text-xs">
              <span className="text-slate-400 font-semibold mb-1 px-1">Прикрепить тестовый документ:</span>
              {sampleFiles.map((f, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAttachedFile(f)}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800 text-left text-slate-200"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate flex-1">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Напишите задачу естественным языком или введите /command..."
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={(!inputText.trim() && !attachedFile) || isLoading}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-medium text-sm flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Отправить</span>
          </button>
        </form>
      </div>
    </div>
  );
};
