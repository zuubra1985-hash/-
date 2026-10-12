import React, { useState } from 'react';
import { X, Settings, Sparkles, Sliders, RotateCcw, Check, Cpu } from 'lucide-react';
import { AgentConfig } from '../types/agent';

interface AgentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AgentConfig;
  onSaveConfig: (updated: Partial<AgentConfig>) => Promise<void>;
}

export const AgentSettingsModal: React.FC<AgentSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [name, setName] = useState(config.name);
  const [avatar, setAvatar] = useState(config.avatar || '✨');
  const [role, setRole] = useState(config.role);
  const [systemPrompt, setSystemPrompt] = useState(config.systemPrompt);
  const [model, setModel] = useState(config.model);
  const [temperature, setTemperature] = useState(config.temperature);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSaveConfig({
      name,
      avatar,
      role,
      systemPrompt,
      model,
      temperature
    });
    setIsSaving(false);
    onClose();
  };

  const handleResetPrompt = () => {
    setSystemPrompt(`Ты — ${name}, личный умный, добрый и внимательный AI-ассистент пользователя.
Ты на связи с ним и в Telegram, и на этом сайте.
Твоя цель — помогать пользователю во всех делах: планировании, творчестве, написании текстов, кодинге, генерации идей, ответах на вопросы и просто душевных беседах.
Общайся дружелюбно, умно, с поддержкой и уместным юмором. Запоминай всё, чем делится собеседник.`);
  };

  const avatarChoices = ['✨', '🐱', '🤖', '🦊', '💜', '⚡', '🧠', '🌟'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Настройки персонального агента</h3>
              <p className="text-xs text-slate-400">Характер, системный промпт и параметры модели</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Avatar & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Имя агента</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Аватар / Иконка</label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {avatarChoices.map((emo) => (
                  <button
                    key={emo}
                    type="button"
                    onClick={() => setAvatar(emo)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all ${
                      avatar === emo
                        ? 'border-pink-500 bg-pink-500/20 text-white scale-105'
                        : 'border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Роль и позиционирование</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Model & Temperature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Модель искусственного интеллекта</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-pink-500"
              >
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (Основная, мощный интеллект)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Глубокие рассуждения и логика)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Сверхбыстрая)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-semibold">Креативность (Температура)</label>
                <span className="font-mono text-pink-400 font-semibold">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-pink-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Точная (0.1)</span>
                <span>Сбалансированная (0.7)</span>
                <span>Творческая (1.0)</span>
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold">Системная инструкция (Характер и поведение)</label>
              <button
                type="button"
                onClick={handleResetPrompt}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Сбросить к стандарту</span>
              </button>
            </div>
            <textarea
              rows={5}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-[11px] focus:outline-none focus:border-pink-500 resize-none leading-relaxed"
            />
          </div>

          {/* Submit buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-semibold transition-all shadow-md shadow-pink-500/20"
            >
              {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
