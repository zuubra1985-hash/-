import React, { useState } from 'react';
import { Bot, Sparkles, X, Plus } from 'lucide-react';
import { AgentRoleType } from '../types/factory';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAgent: (agentData: any) => Promise<void>;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  onCreateAgent
}) => {
  const [name, setName] = useState('');
  const [mission, setMission] = useState('');
  const [domain, setDomain] = useState('');
  const [role, setRole] = useState<AgentRoleType>('SPECIALIST');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['source_verification']);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mission.trim()) return;

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    await onCreateAgent({
      id,
      name: name.toUpperCase(),
      mission,
      domain: domain || 'Общая отраслевая экспертиза',
      role,
      skills: selectedSkills,
      responsibilities: [
        `Профильный анализ задач по направлению ${domain || name}`,
        'Проверка соответствия регламентам и первичным источникам',
        'Формирование экспертных рекомендаций'
      ],
      capabilities: ['Анализ контекста и документов', 'Формирование отчетов']
    });

    onClose();
  };

  const availableSkills = [
    { id: 'source_verification', label: 'Верификация источников' },
    { id: 'regulatory_cross_check', label: 'Регуляторная сверка' },
    { id: 'financial_audit', label: 'Финансовый аудит' },
    { id: 'grant_compliance_check', label: 'Грантовый аудит' },
    { id: 'code_ast_analysis', label: 'Анализ кода (AST)' }
  ];

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Создание нового агента (Section 8 &amp; 9)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Имя агента (например: TRAVEL_AGENT, HR_REVIEWER)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="TRAVEL_AGENT"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Ролевой тип (Section 10)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AgentRoleType)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
            >
              <option value="SPECIALIST">SPECIALIST (Узкий эксперт)</option>
              <option value="RESEARCHER">RESEARCHER (Исследователь)</option>
              <option value="ANALYST">ANALYST (Аналитик)</option>
              <option value="REVIEWER">REVIEWER (Ревьюер)</option>
              <option value="DEVELOPER">DEVELOPER (Разработчик)</option>
              <option value="FACT_CHECKER">FACT_CHECKER (Фактчекер)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Предметная область (Domain)</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Туризм, бронирование, логистика, визовые регламенты"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Главная миссия агента</label>
            <textarea
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              rows={3}
              placeholder="Опишите ключевую цель и ответственность агента..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Подключаемые навыки (Skills):</label>
            <div className="flex flex-wrap gap-1.5">
              {availableSkills.map((sk) => {
                const isSelected = selectedSkills.includes(sk.id);
                return (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => toggleSkill(sk.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors border ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    #{sk.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Создать и протестировать</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
