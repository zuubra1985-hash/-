import React from 'react';
import { Cpu, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { AgentDefinition, GlobalRule, SkillDefinition, TestCase, ErrorRecord, PullRequest, ModelRouterConfig } from '../types/factory';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentDefinition[];
  skills: SkillDefinition[];
  rules: GlobalRule[];
  tests: TestCase[];
  errors: ErrorRecord[];
  pullRequests: PullRequest[];
  modelConfig: ModelRouterConfig;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  agents,
  skills,
  rules,
  tests,
  errors,
  pullRequests,
  modelConfig
}) => {
  if (!isOpen) return null;

  const healthyCount = agents.filter((a) => a.status === 'HEALTHY').length;
  const lastError = errors[errors.length - 1];
  const pendingPrs = pullRequests.filter((p) => p.status === 'OPEN_AWAITING_APPROVAL').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">/status // СИСТЕМНОЕ СОСТОЯНИЕ AI OS</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">
            ×
          </button>
        </div>

        <div className="space-y-2.5 text-slate-300">
          <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Ядро ИИ (AI Core):</span>
            <span className="text-emerald-400 font-bold">Google Gemini ({modelConfig.default_model})</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Master Agent:</span>
            <span className="text-emerald-400 font-bold">v1.0 [ACTIVE]</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Специализированные агенты:</span>
            <span className="text-white font-bold">{agents.length} ({healthyCount} HEALTHY)</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Повторно используемые навыки (Skills):</span>
            <span className="text-white font-bold">{skills.length}</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Глобальные правила (Global Rules):</span>
            <span className="text-white font-bold">{rules.length} (VALIDATED)</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Активные тесты:</span>
            <span className="text-white font-bold">{tests.length} (Golden suite)</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Очередь Pull Requests (Human Gate):</span>
            <span className="text-amber-400 font-bold">{pendingPrs} PR</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Последняя ошибка:</span>
            <span className="text-rose-400 font-bold">{lastError?.error_id || 'Нет'}</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">GitHub Actions:</span>
            <span className="text-emerald-400 font-bold">DISPATCH READY (PASS)</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Дневной расход LLM:</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              ${modelConfig.daily_cost_current.toFixed(4)} / ${modelConfig.max_cost_per_day.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
