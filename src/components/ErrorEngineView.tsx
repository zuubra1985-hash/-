import React from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  Cpu,
  Layers,
  HelpCircle
} from 'lucide-react';
import { ErrorRecord, GlobalRule, SkillDefinition } from '../types/factory';

interface ErrorEngineViewProps {
  errors: ErrorRecord[];
  rules: GlobalRule[];
  skills: SkillDefinition[];
  onProposeGlobalRule: (title: string, desc: string) => Promise<void>;
}

export const ErrorEngineView: React.FC<ErrorEngineViewProps> = ({
  errors,
  rules,
  skills,
  onProposeGlobalRule
}) => {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Движок системных ошибок и Root Cause Analysis (Section 16 & 17)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Исправление первопричин вместо симптомов • Мета-обучение (Meta-Learning) • Автогенерация Global Rules
          </p>
        </div>
      </div>

      {/* Meta-Learning Banner (Section 46) */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-indigo-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">
              МЕТА-ОБУЧЕНИЕ (Meta-Learning Pattern Detector — Section 46)
            </h2>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            SYSTEM DISCOVERY
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Система обнаружила кластеризацию похожих ошибок у нескольких агентов: <span className="font-mono text-indigo-300">LAWYER</span>,{' '}
          <span className="font-mono text-indigo-300">MINISTRY</span> и{' '}
          <span className="font-mono text-indigo-300">GRANT_REVIEWER</span> совершали ошибки, ссылаясь на непроверенные проекты документов.
        </p>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-indigo-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="font-mono text-[11px] text-slate-300">
            <span className="text-indigo-400 font-bold">Сформировано глобальное правило:</span> RULE-001 (Обязательная проверка первичного источника)
          </div>
          <button
            onClick={() =>
              onProposeGlobalRule(
                'RULE-004: Запрет на допущение без ссылки',
                'Каждое фактологическое суждение обязано иметь верифицированный URI реестра.'
              )
            }
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs whitespace-nowrap"
          >
            Предложить новое Global Rule
          </button>
        </div>
      </div>

      {/* Root Cause Analysis Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Журнал дефектов с глубоким RCA-разбором</h2>

        <div className="grid grid-cols-1 gap-4">
          {errors.map((err) => (
            <div
              key={err.error_id}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm"
            >
              {/* Card top */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {err.error_id}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Агент: {err.agent_id.toUpperCase()}</span>
                  <span className="text-xs font-mono text-slate-500">[{err.task_id}]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      err.status === 'fixed'
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    }`}
                  >
                    {err.status.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{err.timestamp}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {err.description}
              </p>

              {/* RCA 3-layer Breakdown (Section 17) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                {/* 1. Symptom */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">1. ВИДИМЫЙ СИМПТОМ</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{err.symptom}</p>
                </div>

                {/* 2. Intermediate */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-amber-500 block mb-1">2. ПРОМЕЖУТОЧНАЯ ПРИЧИНА</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{err.intermediate_cause}</p>
                </div>

                {/* 3. Root Cause */}
                <div className="p-3 rounded-lg bg-slate-950 border border-rose-500/40 bg-rose-950/10">
                  <span className="text-[10px] text-rose-400 block mb-1 font-bold">3. АРХИТЕКТУРНЫЙ ROOT CAUSE</span>
                  <p className="text-rose-200 text-[11px] leading-relaxed font-semibold">{err.root_cause}</p>
                </div>
              </div>

              {/* Expected vs Actual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px] font-mono">Ожидаемое поведение:</span>
                  <p className="text-emerald-400/90 text-[11px]">{err.expected}</p>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-mono">Фактическое поведение:</span>
                  <p className="text-rose-400/90 text-[11px]">{err.actual}</p>
                </div>
              </div>

              {/* Proposed Architectural Fix */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="font-mono text-[11px] text-slate-300">
                  <span className="text-emerald-400 font-semibold">Архитектурный патч:</span> {err.proposed_fix}
                </div>
                {err.affected_skill && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                    skill: #{err.affected_skill}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
