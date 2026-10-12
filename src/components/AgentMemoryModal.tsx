import React, { useState } from 'react';
import { X, Brain, Plus, Trash2, CheckCircle2, Bookmark, Target, Sparkles, Sliders } from 'lucide-react';
import { MemoryItem } from '../types/agent';

interface AgentMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  onAddMemory: (content: string, category: MemoryItem['category']) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
  agentName: string;
}

export const AgentMemoryModal: React.FC<AgentMemoryModalProps> = ({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onDeleteMemory,
  agentName
}) => {
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryItem['category']>('fact');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsAdding(true);
    await onAddMemory(newContent.trim(), newCategory);
    setNewContent('');
    setIsAdding(false);
  };

  const getCategoryBadge = (category: MemoryItem['category']) => {
    switch (category) {
      case 'goal':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">Цель</span>;
      case 'preference':
        return <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-semibold">Предпочтение</span>;
      case 'instruction':
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">Инструкция</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-semibold">Факт</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Долговременная память {agentName}
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                  {memories.length} записей
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Информация, которую агент помнит о вас во всех диалогах (включая Telegram).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Add form */}
          <form onSubmit={handleAdd} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              Добавить новое знание
            </h4>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500 shrink-0"
              >
                <option value="fact">Факт (о вас, проекте, опыте)</option>
                <option value="goal">Цель (к чему стремитесь)</option>
                <option value="preference">Предпочтение (стиль, формат)</option>
                <option value="instruction">Правило / Инструкция</option>
              </select>

              <input
                type="text"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Например: Мой любимый язык — TypeScript, работаю над стартапом..."
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-purple-500"
              />

              <button
                type="submit"
                disabled={!newContent.trim() || isAdding}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-medium transition-colors shrink-0 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Запомнить</span>
              </button>
            </div>
          </form>

          {/* Memories List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Сохраненные воспоминания ({memories.length})
            </h4>

            {memories.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950/50 border border-slate-800/80 text-slate-500 text-xs">
                Пока ничего не сохранено. Вы можете добавить факты вручную или написать в чат «Запомни, что...»!
              </div>
            ) : (
              memories.map((m) => (
                <div
                  key={m.id}
                  className="group flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(m.category)}
                      <span className="text-[10px] text-slate-500 font-mono">{m.addedAt}</span>
                    </div>
                    <p className="text-sm text-slate-200">{m.content}</p>
                  </div>

                  <button
                    onClick={() => onDeleteMemory(m.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-80 group-hover:opacity-100"
                    title="Забыть этот факт"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>Агент автоматически учитывает память при генерации каждого ответа.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
