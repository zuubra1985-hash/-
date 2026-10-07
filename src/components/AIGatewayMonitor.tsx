import React, { useState } from 'react';
import {
  Cpu,
  ShieldCheck,
  Zap,
  DollarSign,
  Lock,
  Layers,
  Activity,
  Sliders,
  Play,
  RotateCw,
  CheckCircle2,
  Sparkles,
  Terminal
} from 'lucide-react';
import { ModelRouterConfig } from '../types/factory';

interface AIGatewayMonitorProps {
  modelConfig: ModelRouterConfig;
  onUpdateConfig: (newConfig: Partial<ModelRouterConfig>) => void;
}

export const AIGatewayMonitor: React.FC<AIGatewayMonitorProps> = ({
  modelConfig,
  onUpdateConfig
}) => {
  const [testPrompt, setTestPrompt] = useState('Проанализируй статус готовности агентов к аудиту');
  const [testResult, setTestResult] = useState<{
    text: string;
    model: string;
    durationMs: number;
    tokensEstimate: number;
    isLive: boolean;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const percentUsed = ((modelConfig.daily_cost_current / modelConfig.max_cost_per_day) * 100).toFixed(1);

  const handleRunGeminiTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testPrompt,
          model: modelConfig.default_model
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      }
    } catch (err) {
      console.warn('Gemini test error:', err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Google Gemini AI Gateway &amp; Model Router</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              @google/genai ^2.4.0
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Нативная интеграция Gemini 3.8 Flash &amp; 3.1 Flash Lite • Динамическая маршрутизация • Контроль токенов и бюджета
          </p>
        </div>

        {/* Model Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => onUpdateConfig({ default_model: 'gemini-3.8-flash' })}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
              modelConfig.default_model === 'gemini-3.8-flash'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            gemini-3.8-flash (Flagship)
          </button>
          <button
            onClick={() => onUpdateConfig({ default_model: 'gemini-3.1-flash-lite' })}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
              modelConfig.default_model === 'gemini-3.1-flash-lite'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            gemini-3.1-flash-lite (Fast)
          </button>
        </div>
      </div>

      {/* Gemini Live Interactive Playground Card */}
      <div className="p-5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">
              Интерактивный тест ядра Gemini (Live Engine Tester)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>АКТИВНАЯ МОДЕЛЬ: {modelConfig.default_model}</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder="Введите запрос для прямой отправки в Gemini..."
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleRunGeminiTest}
            disabled={isTesting || !testPrompt.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
          >
            {isTesting ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Выполнить через Gemini</span>
          </button>
        </div>

        {testResult && (
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
              <span className="text-emerald-400 font-bold">МОДЕЛЬ: {testResult.model}</span>
              <div className="flex items-center gap-3">
                <span>Задержка: {testResult.durationMs} мс</span>
                <span>Токены: ~{testResult.tokensEstimate}</span>
                <span className={testResult.isLive ? 'text-emerald-400' : 'text-amber-400'}>
                  {testResult.isLive ? '● Live API Call' : '● Deterministic Sandbox'}
                </span>
              </div>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans">
              {testResult.text}
            </p>
          </div>
        )}
      </div>

      {/* Budget & Cost Strip (Section 41) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Daily cost */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Дневной расход (Daily Burn)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              ${modelConfig.daily_cost_current.toFixed(4)}
            </span>
            <span className="text-xs font-mono text-slate-500">
              / ${modelConfig.max_cost_per_day.toFixed(2)}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, parseFloat(percentUsed))}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">Использовано {percentUsed}% от лимита</span>
        </div>

        {/* Max cost per task */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Лимит на задачу (Max Per Task)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            ${modelConfig.max_cost_per_task.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            При превышении порога пайплайн останавливается с уведомлением пользователя.
          </p>
        </div>

        {/* Max tokens per task */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Лимит токенов (Token Window)</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {modelConfig.max_tokens_per_task.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Защита от бесконечных циклов в рефлексивных агентах.
          </p>
        </div>
      </div>

      {/* Model Router Architecture (Section 34) */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Динамический роутер моделей под Gemini (Task-based Model Router)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block">ПРОСТЫЕ ЗАДАЧИ &amp; КЛАССИФИКАЦИЯ</span>
            <div className="font-bold text-emerald-400">gemini-3.1-flash-lite</div>
            <p className="text-[10px] text-slate-400">Минимальная задержка и стоимость для базовой маршрутизации</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block">АНАЛИТИКА &amp; РАССУЖДЕНИЯ</span>
            <div className="font-bold text-white">gemini-3.8-flash</div>
            <p className="text-[10px] text-slate-400">Глубокий аудит нормативных коллизий и смет</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block">КОД &amp; AST АНАЛИЗ</span>
            <div className="font-bold text-white">gemini-3.8-flash (Coding)</div>
            <p className="text-[10px] text-slate-400">Генерация патчей, AST проверка и CI/CD workflow</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block">БОЛЬШИЕ ДОКУМЕНТЫ (PDF/DOCX)</span>
            <div className="font-bold text-white">gemini-3.8-flash (Long-ctx)</div>
            <p className="text-[10px] text-slate-400">Парсинг 50+ страниц конкурсной документации</p>
          </div>
        </div>
      </div>

      {/* Security & Secret Vault Status (Section 36 & 37) */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Слой безопасности и изоляции ключей Gemini (Security &amp; Secret Isolation)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">GEMINI_API_KEY</span>
            <span className="text-emerald-400 font-bold">SECURED (Server-side Only)</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">TELEGRAM_BOT_TOKEN</span>
            <span className="text-emerald-400 font-bold">SECURED (Webhook Secret)</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">GITHUB_APP_KEY</span>
            <span className="text-emerald-400 font-bold">SECURED (Secrets Vault)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
