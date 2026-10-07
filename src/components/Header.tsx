import React from 'react';
import { ShieldCheck, Cpu, Terminal, GitPullRequest } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingPrsCount: number;
  dailyCost: number;
  maxDailyCost: number;
  activeModel?: string;
  onOpenStatusModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pendingPrsCount,
  dailyCost,
  maxDailyCost,
  activeModel = 'gemini-3.8-flash',
  onOpenStatusModal
}) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Brand wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="#console"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('console');
          }}
          className="text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors"
        >
          AI AGENT FACTORY
        </a>
        <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          OS v1.0
        </span>
      </div>

      {/* Zone 2: 4-6 text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('console')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'console' ? 'text-white border-b-2 border-emerald-500 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          Telegram Console
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'agents' ? 'text-white border-b-2 border-emerald-500 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          Каталог агентов
        </button>
        <button
          onClick={() => setActiveTab('orchestration')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'orchestration' ? 'text-white border-b-2 border-emerald-500 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          Оркестрация
        </button>
        <button
          onClick={() => setActiveTab('evolve')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'evolve' ? 'text-white border-b-2 border-emerald-500 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          Самоулучшение
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'memory' ? 'text-white border-b-2 border-emerald-500 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          Память 7L
        </button>
        <button
          onClick={() => setActiveTab('github')}
          className={`relative transition-colors whitespace-nowrap ${
            activeTab === 'github' ? 'text-white border-b-2 border-emerald-500 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          GitHub & PRs
          {pendingPrsCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pendingPrsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('gateway')}
          className={`transition-colors whitespace-nowrap ${
            activeTab === 'gateway' ? 'text-white border-b-2 border-emerald-500 pb-0.5' : 'hover:text-slate-200'
          }`}
        >
          Шлюз & Бюджет
        </button>
      </nav>

      {/* Zone 3: Primary actions & quick indicators */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{activeModel}</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <span>Бюджет:</span>
          <span className="text-emerald-400 font-semibold tabular-nums">
            ${dailyCost.toFixed(4)}
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-500 tabular-nums">${maxDailyCost.toFixed(2)}</span>
        </div>

        <button
          onClick={onOpenStatusModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>/status</span>
        </button>
      </div>
    </header>
  );
};
