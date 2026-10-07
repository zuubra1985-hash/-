import React, { useState } from 'react';
import {
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Play
} from 'lucide-react';
import { AgentDefinition, PullRequest } from '../types/factory';

interface SelfImprovementLabProps {
  agents: AgentDefinition[];
  pullRequests: PullRequest[];
  onApprovePr: (prId: string) => Promise<void>;
  onRejectPr: (prId: string) => Promise<void>;
  onTriggerEvolve: (agentId: string) => Promise<void>;
  isEvolving: boolean;
}

export const SelfImprovementLab: React.FC<SelfImprovementLabProps> = ({
  agents,
  pullRequests,
  onApprovePr,
  onRejectPr,
  onTriggerEvolve,
  isEvolving
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || 'grant_reviewer');

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];
  const pendingPrs = pullRequests.filter((pr) => pr.status === 'OPEN_AWAITING_APPROVAL');

  const evolutionSteps = [
    { title: '1. Реальная задача (Real Task)', desc: 'Запуск боевого задания в Telegram или CI/CD', status: 'done' },
    { title: '2. Оценка качества (8 Vectors)', desc: 'Точность (25%), Полнота (20%), Логика (15%), Источники (10%)...', status: 'done' },
    { title: '3. Детекция ошибок', desc: 'Сравнение фактического результата с ожидаемым критерием', status: 'done' },
    { title: '4. Анализ первопричины (RCA)', desc: 'Поиск архитектурного дефекта workflow вместо симптома', status: 'done' },
    { title: '5. Оптимизатор (Optimizer)', desc: 'Генерация спецификации изменения change_id и патча навыка', status: 'done' },
    { title: '6. Кандидатная версия', desc: 'Сборка v1.1 в изолированной песочнице', status: 'done' },
    { title: '7. Тестовый набор (8 типов)', desc: 'Basic, Complex, Edge, Incomplete, Adversarial, Source...', status: 'done' },
    { title: '8. Регрессионный контроль', desc: 'Проверка старых сценариев. При регрессии — отмена релиза', status: 'done' },
    { title: '9. Human-in-the-Loop Gate', desc: 'Pull Request ждет подтверждения человека в Telegram / UI', status: 'gate' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Лаборатория самоулучшения (Self-Improvement Engine)</h1>
          <p className="text-xs text-slate-400 mt-1">
            Section 26 & 66: Измеряемый цикл эволюции без галлюцинаций • Регрессионные гейты • Human-in-the-Loop
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.version}) — {a.score.total}/100
              </option>
            ))}
          </select>

          <button
            onClick={() => onTriggerEvolve(selectedAgentId)}
            disabled={isEvolving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm whitespace-nowrap"
          >
            {isEvolving ? <Cpu className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Запустить цикл /evolve</span>
          </button>
        </div>
      </div>

      {/* Philosophy Callout (Section 66) */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white block mb-0.5">Критерий истинного самоулучшения (Section 66):</span>
          <span>
            Система НЕ считается самообучающейся только потому, что она переписывает системный промпт. Новая версия принимается ТОЛЬКО если
            есть измеряемый рост по 8 векторам и 0 регрессионных сбоев на старых сценариях.
          </span>
        </div>
      </div>

      {/* The 9-step Evolution Loop Pipeline */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <h3 className="text-xs font-mono font-semibold text-slate-400 mb-4">ЖИЗНЕННЫЙ ЦИКЛ ОДНОЙ ЭВОЛЮЦИИ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-2">
          {evolutionSteps.map((step, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-xs flex flex-col justify-between ${
                step.status === 'gate'
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono text-slate-500 block mb-1">ШАГ {idx + 1}</span>
                <h4 className="font-bold text-white text-[11px] mb-1 leading-snug">{step.title}</h4>
                <p className="text-[10px] text-slate-400 leading-tight">{step.desc}</p>
              </div>
              <div className="mt-2 text-right">
                {step.status === 'gate' ? (
                  <span className="text-[10px] font-mono font-bold text-amber-400">GATE ✋</span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">PASS ✅</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Pull Requests (Human-in-the-Loop) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GitPullRequest className="w-4 h-4 text-emerald-400" />
            <span>Очередь Pull Requests на подтверждение человеком (Human-in-the-Loop)</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {pendingPrs.length} кандидатных версий
          </span>
        </div>

        {pendingPrs.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
            Нет открытых PR на утверждение. Запустите /evolve для выбранного агента.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPrs.map((pr) => (
              <div
                key={pr.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20">
                      PR #{pr.pr_number}
                    </span>
                    <h3 className="text-sm font-bold text-white">{pr.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400">Агент:</span>
                    <span className="text-white font-semibold">{pr.agent_id.toUpperCase()}</span>
                    <span className="text-slate-600">({pr.current_version} → {pr.candidate_version})</span>
                  </div>
                </div>

                {/* Score Delta Display */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Текущий балл</span>
                    <span className="text-slate-300 font-bold text-sm tabular-nums">{pr.current_score}/100</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Балл кандидата</span>
                    <span className="text-emerald-400 font-bold text-sm tabular-nums flex items-center gap-1">
                      <span>{pr.candidate_score}/100</span>
                      <span className="text-xs text-emerald-500">(+{pr.candidate_score - pr.current_score})</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Регрессионный тест</span>
                    <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{pr.regression_status} (0 регрессий)</span>
                    </span>
                  </div>
                </div>

                {/* Diff Summary */}
                <div className="space-y-2 text-xs">
                  <span className="text-slate-400 font-semibold block">Внесенные архитектурные изменения:</span>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/60 font-mono text-[11px] text-slate-300 space-y-1">
                    {pr.diff_summary.workflow_changes.map((ch, idx) => (
                      <div key={idx} className="text-emerald-400/90">{ch}</div>
                    ))}
                    {pr.diff_summary.verification_steps_added.map((vs, idx) => (
                      <div key={idx} className="text-slate-400">+ Добавлен шлюз: {vs}</div>
                    ))}
                  </div>
                </div>

                {/* Approval Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => onRejectPr(pr.id)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
                  >
                    Отклонить PR
                  </button>
                  <button
                    onClick={() => onApprovePr(pr.id)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Одобрить и выпустить релиз (Merge PR)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
