import React, { useState } from 'react';
import {
  GitFork,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Sliders,
  Scale,
  FileCheck
} from 'lucide-react';
import { AgentDefinition } from '../types/factory';

interface MultiAgentOrchestrationProps {
  agents: AgentDefinition[];
  onExecutePipeline: (taskTitle: string) => Promise<void>;
  isExecuting: boolean;
}

export const MultiAgentOrchestration: React.FC<MultiAgentOrchestrationProps> = ({
  agents,
  onExecutePipeline,
  isExecuting
}) => {
  const [activeScenario, setActiveScenario] = useState<'grant' | 'contract' | 'architecture'>('grant');

  const pipelineStages = [
    {
      id: 'doc_analyzer',
      name: 'Document Analyzer',
      agent: 'GRANT_REVIEWER',
      task: 'Извлечение структуры, метаданных и требований фонда',
      status: 'COMPLETED'
    },
    {
      id: 'lawyer',
      name: 'Legal Compliance',
      agent: 'LAWYER',
      task: 'Проверка полномочий, устава и антимонопольных ограничений',
      status: 'COMPLETED'
    },
    {
      id: 'ministry',
      name: 'Regulatory Check',
      agent: 'MINISTRY',
      task: 'Сверка с отраслевыми приказами и регистрацией в Минюсте',
      status: 'COMPLETED'
    },
    {
      id: 'economist',
      name: 'Financial Audit',
      agent: 'ECONOMIST',
      task: 'Аудит сметы, налоговых ставок и расчет софинансирования',
      status: 'COMPLETED'
    },
    {
      id: 'fact_checker',
      name: 'Fact & Source Check',
      agent: 'FACT_CHECKER',
      task: 'Пинг внешних ссылок и сверка выписок ЕГРЮЛ',
      status: 'COMPLETED'
    },
    {
      id: 'reviewer',
      name: 'Arbitration & Synthesis',
      agent: 'REVIEWER',
      task: 'Выявление скрытых коллизий и расчет 8 векторов качества',
      status: 'COMPLETED'
    },
    {
      id: 'master',
      name: 'Master Agent',
      agent: 'MASTER_AGENT',
      task: 'Формирование проверенного итогового отчета в Telegram',
      status: 'COMPLETED'
    }
  ];

  const contradictionScenarios = [
    {
      id: 'contra-01',
      title: 'Коллизия в оценке ведомственного акта (LAWYER vs MINISTRY)',
      claimA: 'LAWYER: Приказ профильного ведомства № 412 обязателен к исполнению контрагентом.',
      sourceA: 'regulation.gov.ru (проект документа)',
      weightA: 'EXPERIENCE / PREVIEW',
      claimB: 'MINISTRY: Приказ № 412 не прошел регистрацию в Минюсте РФ и не имеет обязательной силы.',
      sourceB: 'publication.pravo.gov.ru & Реестр Минюста',
      weightB: 'PRIMARY SOURCE (Высший приоритет)',
      resolution:
        'Арбитраж REVIEWER: В соответствии с иерархией источников (PRIMARY SOURCE > MODEL ASSUMPTION), позиция MINISTRY принята. Приказ не влечет правовых последствий.',
      status: 'RESOLVED_BY_PRIMARY_SOURCE'
    },
    {
      id: 'contra-02',
      title: 'Расхождение в ставке налогообложения (ACCOUNTANT vs ECONOMIST)',
      claimA: 'ECONOMIST: Ставка страховых взносов по НКО принята как 30.0% в базовой смете.',
      sourceA: 'Стандартные формулы модели',
      weightA: 'MODEL ASSUMPTION',
      claimB: 'ACCOUNTANT: НКО на УСН имеет право на пониженный тариф 7.6% (ст. 427 НК РФ).',
      sourceB: 'Налоговый кодекс РФ ч. 2, ст. 427',
      weightB: 'PRIMARY SOURCE',
      resolution:
        'Арбитраж REVIEWER: Смета скорректирована с учетом льготной ставки 7.6%. Экономия бюджета проекта составила 182 400 руб.',
      status: 'RESOLVED_BY_PRIMARY_SOURCE'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Мультиагентный оркестратор (Section 51 & 52)</h1>
          <p className="text-xs text-slate-400 mt-1">
            Координация команды специализированных агентов • Детекция противоречий • Арбитраж первоисточников
          </p>
        </div>

        <button
          onClick={() => onExecutePipeline('Комплексная экспертиза грантовой заявки')}
          disabled={isExecuting}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          {isExecuting ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>Запустить пайплайн</span>
        </button>
      </div>

      {/* Visual Pipeline Runner */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono font-semibold text-slate-400">ПОСЛЕДОВАТЕЛЬНЫЙ ПАЙПЛАЙН ЗАДАЧИ</span>
          <span className="text-xs font-mono text-emerald-400">STATUS: READY / DISPATCHABLE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
          {pipelineStages.map((stage, idx) => (
            <div
              key={stage.id}
              className="flex flex-col justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-500">0{idx + 1}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1 truncate">{stage.name}</h4>
                <p className="text-[10px] text-emerald-400 font-mono mb-2">@{stage.agent}</p>
                <p className="text-[11px] text-slate-400 leading-tight">{stage.task}</p>
              </div>

              {idx < pipelineStages.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] text-slate-400">
                    →
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contradiction Detection Lab (Section 52) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Детекция и арбитраж противоречий (Contradiction Resolver)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Система не выбирает случайный ответ при споре агентов. Действует формула: Primary Source &gt; Verified Knowledge &gt; Experience &gt; Memory &gt; Assumption.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {contradictionScenarios.map((contra) => (
            <div key={contra.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">{contra.title}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  АРБИТРАЖ УСПЕШЕН
                </span>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 font-mono text-[10px] block mb-1">Позиция А:</span>
                  <p className="text-slate-300 mb-2 leading-relaxed">{contra.claimA}</p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Источник: <span className="text-slate-400">{contra.sourceA}</span>
                  </div>
                  <div className="text-[10px] text-amber-400/80 font-mono mt-1">
                    Вес: {contra.weightA}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/30">
                  <span className="text-emerald-400 font-mono text-[10px] block mb-1">Позиция B (Выиграла):</span>
                  <p className="text-slate-200 mb-2 leading-relaxed">{contra.claimB}</p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Источник: <span className="text-slate-300 font-semibold">{contra.sourceB}</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-1">
                    Вес: {contra.weightB}
                  </div>
                </div>
              </div>

              {/* Resolution Box */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                <span className="text-emerald-400 font-bold block mb-1">Вердикт REVIEWER:</span>
                {contra.resolution}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
