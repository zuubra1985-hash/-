export interface AgentConfig {
  id: string;
  name: string;
  avatar: string;
  role: string;
  systemPrompt: string;
  model: 'gemini-3.8-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite' | string;
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
