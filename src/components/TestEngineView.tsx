import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  Search,
  Filter,
  AlertTriangle,
  Zap,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { TestCase, TestType } from '../types/factory';

interface TestEngineViewProps {
  tests: TestCase[];
  onRunTests: (agentId?: string) => Promise<void>;
  isRunning: boolean;
}

export const TestEngineView: React.FC<TestEngineViewProps> = ({ tests, onRunTests, isRunning }) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const testTypes: TestType[] = [
    'BASIC',
    'COMPLEX',
    'EDGE',
    'INCOMPLETE',
    'CONFLICT',
    'ADVERSARIAL',
    'SOURCE',
    'REGRESSION'
  ];

  const filteredTests = tests.filter((t) => {
    const matchesType = selectedType === 'ALL' || t.type === selectedType;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.agent_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const passedCount = tests.filter((t) => t.last_run_status === 'PASS').length;
  const passRate = ((passedCount / (tests.length || 1)) * 100).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Движок автоматического тестирования (Section 18)</h1>
          <p className="text-xs text-slate-400 mt-1">
            8 типов проверок (Basic, Complex, Edge, Incomplete, Conflict, Adversarial, Source, Regression) • Регрессионный бенчмаркинг
          </p>
        </div>

        <button
          onClick={() => onRunTests()}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          {isRunning ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>Запустить все тесты ({tests.length})</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">Всего тестов</span>
          <span className="text-lg font-bold text-white">{tests.length}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">Успешно (Pass Rate)</span>
          <span className="text-lg font-bold text-emerald-400 tabular-nums">{passRate}%</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">Критические тесты</span>
          <span className="text-lg font-bold text-slate-200">
            {tests.filter((t) => t.critical).length}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">Средняя задержка</span>
          <span className="text-lg font-bold text-slate-200 tabular-nums">1.82 сек</span>
        </div>
      </div>

      {/* Type filter ribbon */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedType('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap ${
            selectedType === 'ALL'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Все ({tests.length})
        </button>
        {testTypes.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors whitespace-nowrap ${
              selectedType === t
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t} ({tests.filter((x) => x.type === t).length})
          </button>
        ))}
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {test.type}
                  </span>
                  <span className="text-xs font-mono text-emerald-400">@{test.agent_id}</span>
                </div>
                <div className="flex items-center gap-2">
                  {test.last_run_status === 'PASS' ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-mono text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>PASS ({test.score}/100)</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-400 font-mono text-xs">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>FAIL ({test.score}/100)</span>
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-bold text-white mb-2">{test.name}</h3>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed mb-3">
                <span className="text-slate-500 block text-[10px] mb-1">ТЕСТОВЫЙ ПРОМПТ / ВХОДНЫЕ ДАННЫЕ:</span>
                "{test.prompt}"
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-slate-500 font-mono text-[10px] block">КРИТЕРИИ ОЦЕНКИ:</span>
                {test.expected_output_criteria.map((cr, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-slate-400 text-[11px]">
                    <span className="text-emerald-400 font-mono">✓</span>
                    <span>{cr}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>{test.last_run_date ? `Запуск: ${test.last_run_date}` : 'Ожидает запуска'}</span>
              <span>{test.execution_time_ms ? `${test.execution_time_ms} ms` : '-'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
