import React, { useState, useEffect } from 'react';
import { AgentHeader } from './components/AgentHeader';
import { TelegramStatusBanner } from './components/TelegramStatusBanner';
import { AgentChat } from './components/AgentChat';
import { AgentMemoryModal } from './components/AgentMemoryModal';
import { AgentSettingsModal } from './components/AgentSettingsModal';
import { AgentConfig, ChatMessage, MemoryItem } from './types/agent';

export default function App() {
  const [config, setConfig] = useState<AgentConfig>({
    id: 'agent-miu-01',
    name: 'Miu',
    avatar: '✨',
    role: 'Персональный AI-ассистент и компаньон',
    systemPrompt: `Ты — Miu (Миу), личный умный, добрый и внимательный AI-ассистент пользователя.
Ты на связи с ним и в Telegram, и на этом сайте.
Твоя цель — помогать пользователю во всех делах: планировании, творчестве, написании текстов, кодинге, генерации идей, ответах на вопросы и просто душевных беседах.
Общайся дружелюбно, умно, с поддержкой и уместным юмором. Запоминай всё, чем делится собеседник.`,
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    telegramBot: {
      username: 'Milachudila_bot',
      firstName: 'Miu',
      id: 8996979262,
      isConnected: true,
      updatesCount: 0,
      messagesSentCount: 0
    }
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [geminiConnected, setGeminiConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  const [isMemoryOpen, setIsMemoryOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync state with server and poll for real-time Telegram messages
  useEffect(() => {
    const fetchState = () => {
      fetch('/api/agent')
        .then((res) => {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then((data) => {
          if (data.agentConfig) setConfig(data.agentConfig);
          if (data.messages) setMessages(data.messages);
          if (data.memories) setMemories(data.memories);
          if (data.geminiConnected !== undefined) setGeminiConnected(data.geminiConnected);
        })
        .catch((err) => {
          console.info('State fetch cache fallback:', err);
        });
    };

    fetchState();
    const timer = setInterval(fetchState, 2000);
    return () => clearInterval(timer);
  }, []);

  // Send message from Web
  const handleSendMessage = async (text: string) => {
    setIsLoading(true);

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      source: 'web'
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!res.ok) throw new Error('Failed to send');
      const data = await res.json();

      if (data.messages) setMessages(data.messages);
      if (data.memories) setMemories(data.memories);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add memory
  const handleAddMemory = async (content: string, category: MemoryItem['category']) => {
    try {
      const res = await fetch('/api/memory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, category })
      });
      const data = await res.json();
      if (data.memories) setMemories(data.memories);
    } catch (err) {
      console.error('Add memory error:', err);
    }
  };

  // Delete memory
  const handleDeleteMemory = async (id: string) => {
    try {
      const res = await fetch(`/api/memory/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.memories) setMemories(data.memories);
    } catch (err) {
      console.error('Delete memory error:', err);
    }
  };

  // Clear chat
  const handleClearChat = async () => {
    if (!window.confirm('Очистить историю диалога на экране?')) return;
    try {
      const res = await fetch('/api/chat/clear', { method: 'POST' });
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (err) {
      console.error('Clear chat error:', err);
    }
  };

  // Save agent settings
  const handleSaveConfig = async (updated: Partial<AgentConfig>) => {
    try {
      const res = await fetch('/api/agent/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.agentConfig) setConfig(data.agentConfig);
    } catch (err) {
      console.error('Save config error:', err);
    }
  };

  // Send test push to Telegram
  const handleTestTelegramSend = async () => {
    setIsSendingTest(true);
    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🔔 Проверка связи! Привет из веб-панели управления агентом Miu ✨ На связи и готова к работе!`
        })
      });
      const data = await res.json();
      if (!res.ok && data.error) {
        alert(data.error);
      } else {
        alert('✅ Тестовое сообщение успешно отправлено в ваш Telegram!');
      }
    } catch (err: any) {
      alert('Ошибка отправки: ' + (err?.message || err));
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0f17] text-slate-100 font-sans selection:bg-pink-500/30 selection:text-pink-200 overflow-hidden">
      {/* Top Navigation */}
      <AgentHeader
        config={config}
        onOpenMemory={() => setIsMemoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onClearChat={handleClearChat}
        onTestTelegramSend={handleTestTelegramSend}
        geminiConnected={geminiConnected}
      />

      {/* Telegram Live Connection Ribbon */}
      <TelegramStatusBanner
        config={config}
        onSendTestMessage={handleTestTelegramSend}
        isSendingTest={isSendingTest}
      />

      {/* Main Interactive Chat */}
      <main className="flex-1 flex overflow-hidden">
        <AgentChat
          messages={messages}
          config={config}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </main>

      {/* Modals */}
      <AgentMemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        memories={memories}
        onAddMemory={handleAddMemory}
        onDeleteMemory={handleDeleteMemory}
        agentName={config.name}
      />

      <AgentSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
