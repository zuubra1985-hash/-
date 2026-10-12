import React, { useState } from 'react';
import { Send, CheckCircle2, RefreshCw, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';
import { AgentConfig } from '../types/agent';

interface TelegramStatusBannerProps {
  config: AgentConfig;
  onSendTestMessage: () => void;
  isSendingTest: boolean;
}

export const TelegramStatusBanner: React.FC<TelegramStatusBannerProps> = ({
  config,
  onSendTestMessage,
  isSendingTest
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const tg = config.telegramBot;

  return (
    <div className="bg-gradient-to-r from-sky-950/60 via-slate-900/90 to-purple-950/40 border-b border-sky-900/30 px-4 py-2.5 text-xs text-slate-300">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>

          <span className="font-semibold text-white">Telegram-канал связи активен:</span>
          <a
            href="https://t.me/Milachudila_bot"
            target="_blank"
            rel="noreferrer"
            className="text-sky-400 font-mono font-medium hover:underline flex items-center gap-1"
          >
            @{tg.username}
          </a>

          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400">
            Пиши боту в Telegram со смартфона или компьютера — история синхронизируется в реальном времени.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSendTestMessage}
            disabled={isSendingTest}
            className="px-2.5 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 border border-sky-500/30 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Отправить проверочный пуш в Telegram"
          >
            <Send className="w-3 h-3" />
            <span>Тест связи</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Показать детали подключения"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-w-5xl mx-auto mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400">
          <div>
            <span className="text-slate-500">Bot ID: </span>
            <span className="text-slate-200">{tg.id}</span>
          </div>
          <div>
            <span className="text-slate-500">Обновлений получено: </span>
            <span className="text-emerald-400 font-bold">{tg.updatesCount}</span>
          </div>
          <div>
            <span className="text-slate-500">Ответов отправлено: </span>
            <span className="text-sky-400 font-bold">{tg.messagesSentCount}</span>
          </div>
          <div>
            <span className="text-slate-500">Последний опрос: </span>
            <span className="text-slate-200">{tg.lastPollTime || 'активен'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
