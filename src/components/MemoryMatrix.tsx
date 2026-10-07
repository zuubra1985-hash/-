import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Plus,
  BookOpen,
  Filter,
  FileCheck
} from 'lucide-react';
import { MemoryItem, MemoryLayer, MemoryItemStatus } from '../types/factory';

interface MemoryMatrixProps {
  memories: MemoryItem[];
  onAddMemory: (newItem: Partial<MemoryItem>) => Promise<void>;
}

export const MemoryMatrix: React.FC<MemoryMatrixProps> = ({ memories, onAddMemory }) => {
  const [selectedLayer, setSelectedLayer] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item modal form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newLayer, setNewLayer] = useState<MemoryLayer>('USER_MEMORY');
  const [newSource, setNewSource] = useState('');

  const layers: { key: MemoryLayer; label: string; desc: string }[] = [
    { key: 'USER_MEMORY', label: 'User Memory', desc: 'Долговременные предпочтения и стиль пользователя' },
    { key: 'AGENT_MEMORY', label: 'Agent Memory', desc: 'Специфический опыт конкретного агента' },
    { key: 'GLOBAL_MEMORY', label: 'Global Memory', desc: 'Общие базовые знания и государственные реестры' },
    { key: 'ERROR_MEMORY', label: 'Error Memory', desc: 'История ошибок и анализ первопричин' },
    { key: 'PATTERN_MEMORY', label: 'Pattern Memory', desc: 'Успешные проверенные алгоритмы' },
    { key: 'RULE_MEMORY', label: 'Rule Memory', desc: 'Подтвержденные конституционные правила' },
    { key: 'TEST_MEMORY', label: 'Test Memory', desc: 'Золотые тестовые наборы и бенчмарки' }
  ];

  const filteredMemories = memories.filter((mem) => {
    const matchesLayer = selectedLayer === 'ALL' || mem.layer === selectedLayer;
    const matchesStatus = selectedStatus === 'ALL' || mem.status === selectedStatus;
    const matchesSearch =
      mem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.provenance.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLayer && matchesStatus && matchesSearch;
  });

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    await onAddMemory({
      layer: newLayer,
      title: newTitle,
      content: newContent,
      provenance: {
        knowledge_id: `KN-MANUAL-${Date.now()}`,
        source: newSource || 'Директива пользователя (/learn)',
        source_type: 'USER_DIRECTIVE',
        date: new Date().toISOString().split('T')[0],
        created_by: 'User in UI',
        confidence: 1.0,
        verified: true,
        verification_method: 'Direct manual directive',
        used_by: ['master_agent']
      },
      status: 'VALIDATED'
    });

    setNewTitle('');
    setNewContent('');
    setNewSource('');
    setShowAddModal(false);
  };

  const getStatusBadge = (status: MemoryItemStatus) => {
    switch (status) {
      case 'VALIDATED':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'PROPOSED':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'DRAFT':
        return 'text-slate-400 bg-slate-800 border-slate-700';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">7-уровневый движок памяти (Memory Engine)</h1>
          <p className="text-xs text-slate-400 mt-1">
            Section 14, 15, 47: Провенанс знаний (Provenance) • Иерархия истинности • Защита от случайных обобщений
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить знание (/learn)</span>
        </button>
      </div>

      {/* Provenance Hierarchy Banner (Section 48) */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-white font-mono">
            ИЕРАРХИЯ ДОСТОВЕРНОСТИ (Section 48 — Память не абсолют):
          </span>
          <span className="text-slate-500 font-mono text-[11px]">Strict precedence</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
            1. PRIMARY SOURCE (Первичный источник)
          </span>
          <span className="text-slate-600">&gt;</span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
            2. VERIFIED KNOWLEDGE
          </span>
          <span className="text-slate-600">&gt;</span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            3. EXPERIENCE
          </span>
          <span className="text-slate-600">&gt;</span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
            4. MEMORY
          </span>
          <span className="text-slate-600">&gt;</span>
          <span className="px-2.5 py-1 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40">
            5. MODEL ASSUMPTION
          </span>
        </div>
      </div>

      {/* Layer selector tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <button
          onClick={() => setSelectedLayer('ALL')}
          className={`p-2.5 rounded-lg text-left border transition-all text-xs ${
            selectedLayer === 'ALL'
              ? 'bg-slate-800 border-emerald-500 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="font-bold">Все уровни</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{memories.length} записей</div>
        </button>
        {layers.map((l) => {
          const count = memories.filter((m) => m.layer === l.key).length;
          return (
            <button
              key={l.key}
              onClick={() => setSelectedLayer(l.key)}
              className={`p-2.5 rounded-lg text-left border transition-all text-xs ${
                selectedLayer === l.key
                  ? 'bg-slate-800 border-emerald-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-bold truncate">{l.label}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{count} записей</div>
            </button>
          );
        })}
      </div>

      {/* Search and status filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по содержанию, источнику или провенансу..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto self-start sm:self-auto">
          {['ALL', 'VALIDATED', 'PROPOSED', 'DRAFT'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedStatus === st
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* List of Memory Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMemories.map((mem) => (
          <div
            key={mem.id}
            className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-emerald-400">{mem.layer}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getStatusBadge(
                    mem.status
                  )}`}
                >
                  {mem.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2">{mem.title}</h3>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80 mb-3">
                {mem.content}
              </p>
            </div>

            {/* Provenance Box (Section 47) */}
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
              <div className="flex items-center justify-between">
                <span>Провенанс: {mem.provenance.knowledge_id}</span>
                <span className="text-emerald-400">Достоверность: {(mem.provenance.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="text-slate-300 truncate">
                Источник: <span className="text-slate-400">{mem.provenance.source}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Тип: {mem.provenance.source_type} • Валидатор: {mem.provenance.verification_method}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Добавить проверенное знание (/learn)</h3>

            <form onSubmit={handleSaveMemory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Уровень памяти</label>
                <select
                  value={newLayer}
                  onChange={(e) => setNewLayer(e.target.value as MemoryLayer)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                >
                  {layers.map((l) => (
                    <option key={l.key} value={l.key}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Краткий заголовок</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Например: Правило софинансирования ФПГ"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Содержание знания</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Точная формулировка правила, нормы или паттерна..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Первичный источник (Provenance)</label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="Например: ст. 427 НК РФ или регламент фонда"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
