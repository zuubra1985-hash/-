import React from 'react';
import { Bot, ExternalLink, Sparkles, Brain, Settings, Trash2, Send } from 'lucide-react';
import { AgentConfig } from '../types/agent';

interface AgentHeaderProps {
  config: AgentConfig;
  onOpenMemory: () => void;
  onOpenSettings: () => void;
  onClearChat: () => void;
  onTestTelegramSend: () => void;
  geminiConnected?: boolean;
  aiStatus?: { provider: string; model: string; connected: boolean };
}

export const AgentHeader: React.FC<AgentHeaderProps> = ({
  config,
  onOpenMemory,
  onOpenSettings,
  onClearChat,
  onTestTelegramSend,
  aiStatus
}) => {
  const isTgConnected = config.telegramBot.isConnected;
  const isAiActive = aiStatus?.connected ?? true;

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3 md:px-6">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Agent Identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-indigo-500/30 border border-pink-500/30 flex items-center justify-center text-2xl shadow-inner">
              {config.avatar || '✨'}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-slate-900 ${
                isTgConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
              title={isTgConnected ? 'Telegram подключен и онлайн' : 'Ожидание Telegram'}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                {config.name}
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  AI Agent
                </span>
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {config.model}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>{config.role}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                @Milachudila_bot
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls & Telegram Direct Link */}
        <div className="flex items-center gap-2">
          {/* Direct Telegram Button */}
          <a
            href="https://t.me/Milachudila_bot"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Открыть в Telegram на телефоне или десктопе"
          >
            <span>📱 Открыть в Telegram</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          {/* Memory Modal Button */}
          <button
            onClick={onOpenMemory}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Долговременная память агента"
          >
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">Память</span>
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Настройки агента и промпт"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Настройки</span>
          </button>

          {/* Clear Chat */}
          <button
            onClick={onClearChat}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/60 transition-colors"
            title="Очистить историю диалога"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
