import React, { useState } from 'react';
import {
  Search,
  Plus,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Code2,
  FileCode,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';
import { AgentDefinition, AgentStatus } from '../types/factory';

interface AgentsCatalogProps {
  agents: AgentDefinition[];
  onImproveAgent: (agentId: string) => void;
  onTestAgent: (agentId: string) => void;
  onRollbackAgent: (agentId: string) => void;
  onCreateAgentOpen: () => void;
}

export const AgentsCatalog: React.FC<AgentsCatalogProps> = ({
  agents,
  onImproveAgent,
  onTestAgent,
  onRollbackAgent,
  onCreateAgentOpen
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAgent, setSelectedAgent] = useState<AgentDefinition | null>(null);
  const [showYamlModal, setShowYamlModal] = useState(false);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.mission.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || agent.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'HEALTHY':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'WARNING':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'DEGRADED':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-800';
    }
  };

  const generateYamlSchema = (agent: AgentDefinition) => {
    return `id: ${agent.id}
name: ${agent.name}
version: ${agent.version}
status: ${agent.status}

mission: >
  ${agent.mission}

domain: ${agent.domain}

responsibilities:
${agent.responsibilities.map((r) => `  - "${r}"`).join('\n')}

capabilities:
${agent.capabilities.map((c) => `  - "${c}"`).join('\n')}

knowledge:
${agent.knowledge.map((k) => `  - "${k}"`).join('\n')}

skills:
${agent.skills.map((s) => `  - ${s}`).join('\n')}

tools:
${agent.tools.map((t) => `  - ${t}`).join('\n')}

workflow:
${agent.workflow.map((w) => `  - "${w}"`).join('\n')}

decision_rules:
${agent.decision_rules.map((d) => `  - "${d}"`).join('\n')}

verification:
${agent.verification.map((v) => `  - "${v}"`).join('\n')}

memory:
${agent.memory.map((m) => `  - ${m}`).join('\n')}

restrictions:
${agent.restrictions.map((res) => `  - "${res}"`).join('\n')}

escalation_rules:
${agent.escalation_rules.map((e) => `  - "${e}"`).join('\n')}

test_suite:
${agent.test_suite.map((t) => `  - ${t}`).join('\n')}

score:
  total: ${agent.score.total}
  accuracy: ${agent.score.accuracy}
  completeness: ${agent.score.completeness}
  reasoning: ${agent.score.reasoning}
  factuality: ${agent.score.factuality}
  source_quality: ${agent.score.source_quality}
  instruction_following: ${agent.score.instruction_following}
  safety: ${agent.score.safety}
  efficiency: ${agent.score.efficiency}

known_weaknesses:
${agent.known_weaknesses.map((w) => `  - "${w}"`).join('\n')}

metrics:
  success_rate: ${agent.metrics.success_rate}%
  error_rate: ${agent.metrics.error_rate}%
  task_count: ${agent.metrics.task_count}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Каталог специализированных агентов</h1>
          <p className="text-xs text-slate-400 mt-1">
            Единая схема (Section 9 Agent Schema) • Версионирование • Защита от деградации
          </p>
        </div>

        <button
          onClick={onCreateAgentOpen}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Создать агента (/create)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени, миссии или предметной области..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'HEALTHY', 'WARNING', 'DEGRADED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedStatus === st
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Все статусы' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <div
            key={agent.id}
            className="flex flex-col justify-between p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-lg"
          >
            <div>
              {/* Header line */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">{agent.name}</h3>
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {agent.version}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${getStatusColor(
                    agent.status
                  )}`}
                >
                  {agent.status}
                </span>
              </div>

              {/* Mission */}
              <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                {agent.mission}
              </p>

              {/* Score Bar */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Рейтинг качества:</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">
                    {agent.score.total}/100
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${agent.score.total}%` }}
                  />
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1 text-[10px] font-mono text-slate-400">
                  <div>
                    Точность: <span className="text-slate-200">{agent.score.accuracy}%</span>
                  </div>
                  <div>
                    Полнота: <span className="text-slate-200">{agent.score.completeness}%</span>
                  </div>
                  <div>
                    Логика: <span className="text-slate-200">{agent.score.reasoning}%</span>
                  </div>
                  <div>
                    Факты: <span className="text-slate-200">{agent.score.factuality}%</span>
                  </div>
                </div>
              </div>

              {/* Skills and Tools */}
              <div className="mb-3 space-y-1.5">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-500">Навыки:</span>
                  {agent.skills.map((sk) => (
                    <span key={sk} className="font-mono text-[10px] text-emerald-300/90">
                      #{sk}
                    </span>
                  ))}
                </div>
                {agent.known_weaknesses.length > 0 && (
                  <div className="text-[11px] text-amber-400/90 flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span className="truncate">{agent.known_weaknesses[0]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setSelectedAgent(agent);
                    setShowYamlModal(true);
                  }}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Просмотр YAML схемы"
                >
                  <FileCode className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onTestAgent(agent.id)}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors font-mono"
                  title="Запуск тестового набора"
                >
                  /test
                </button>
                {agent.version_history.length > 1 && (
                  <button
                    onClick={() => onRollbackAgent(agent.id)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition-colors"
                    title="Откат на прошлую версию"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => onImproveAgent(agent.id)}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Улучшить</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* YAML Schema Inspector Modal */}
      {showYamlModal && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  /agents/{selectedAgent.id}/agent.yaml (Section 9 Schema)
                </h3>
              </div>
              <button
                onClick={() => setShowYamlModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono"
              >
                ×
              </button>
            </div>

            <div className="p-5 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950 whitespace-pre leading-relaxed select-all">
              {generateYamlSchema(selectedAgent)}
            </div>

            <div className="flex items-center justify-end px-5 py-3 border-t border-slate-800 bg-slate-900">
              <button
                onClick={() => setShowYamlModal(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
