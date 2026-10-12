export interface AgentConfig {
  id: string;
  name: string;
  avatar: string;
  role: string;
  systemPrompt: string;
  model: 'deepseek/deepseek-chat' | 'deepseek/deepseek-r1' | 'qwen/qwen3.7-flash' | 'meta-llama/llama-3.3-70b-instruct' | 'google/gemini-2.0-flash-001' | 'gemini-3.8-flash' | string;
  provider?: 'openrouter' | 'gemini' | 'auto';
  temperature: number;
  telegramBot: {
    username: string;
    firstName: string;
    id: number;
    isConnected: boolean;
    lastPollTime?: string;
    updatesCount: number;
    messagesSentCount: number;
    lastChatId?: number | string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  source: 'telegram' | 'web';
  chatId?: number | string;
}

export interface MemoryItem {
  id: string;
  category: 'fact' | 'goal' | 'preference' | 'instruction';
  content: string;
  addedAt: string;
  source: 'telegram' | 'web' | 'auto_extracted';
}
