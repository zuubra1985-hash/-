import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  askPersonalAgent,
  isGeminiConnected
} from './src/services/geminiService.ts';
import {
  startTelegramPolling,
  getBotInfo,
  sendMessageToTelegram,
  sendTypingAction
} from './src/services/telegramBotService.ts';
import {
  AgentConfig,
  ChatMessage,
  MemoryItem
} from './src/types/agent.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// In-memory state for the Personal AI Agent
let agentConfig: AgentConfig = {
  id: 'agent-miu-01',
  name: 'Miu',
  avatar: '✨',
  role: 'Персональный AI-ассистент и компаньон',
  systemPrompt: `Ты — Miu (Миу), личный умный, добрый и внимательный AI-ассистент пользователя.
Ты на связи с ним и в Telegram, и на этом сайте.
Твоя цель — помогать пользователю во всех делах: планировании, творчестве, написании текстов, кодинге, генерации идей, ответах на вопросы и просто душевных беседах.
Общайся дружелюбно, умно, с поддержкой и уместным юмором. Запоминай всё, чем делится собеседник.`,
  model: 'gemini-3.8-flash',
  temperature: 0.7,
  telegramBot: {
    username: 'Milachudila_bot',
    firstName: 'Miu',
    id: 8996979262,
    isConnected: false,
    updatesCount: 0,
    messagesSentCount: 0
  }
};

let memories: MemoryItem[] = [
  {
    id: 'mem-1',
    category: 'fact',
    content: 'Пользователь общается с агентом через Telegram-бота @Milachudila_bot',
    addedAt: new Date().toLocaleDateString('ru-RU'),
    source: 'auto_extracted'
  },
  {
    id: 'mem-2',
    category: 'preference',
    content: 'Предпочитает быстрые, умные и структурированные ответы без лишней воды',
    addedAt: new Date().toLocaleDateString('ru-RU'),
    source: 'auto_extracted'
  }
];

let messages: ChatMessage[] = [
  {
    id: 'init-1',
    sender: 'agent',
    text: `Привет! 💖 Я твой персональный AI-агент Miu.

Я напрямую подключена к твоему Telegram-боту @Milachudila_bot и работаю на базе Google Gemini AI.

Ты можешь писать мне прямо здесь или открыть Telegram и отправлять сообщения туда — я всё помню и всегда отвечу! Чем займемся сегодня?`,
    timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    source: 'web'
  }
];

// Helper to handle AI query
async function processAgentTurn(userText: string, source: 'web' | 'telegram', chatId?: number | string): Promise<string> {
  // Check for commands
  const trimmed = userText.trim();
  if (trimmed === '/start' || trimmed === '/help') {
    return `Привет! 💖 Я Miu, твой персональный агент на базе Gemini AI!

Я помню всё, что ты мне рассказываешь, и готова помочь с любыми задачами:
• Просто поболтать или обсудить идею
• Написать код, текст, пост, план
• Найти информацию и структурировать мысли
• Запомнить важное (просто напиши: «Запомни, что...»)

Команды:
/memory — посмотреть всё, что я помню о тебе
/reset — начать диалог с чистого листа
/help — эта справка`;
  }

  if (trimmed === '/memory') {
    if (memories.length === 0) {
      return 'В моей памяти пока нет сохраненных фактов. Напиши мне что-нибудь о себе или «Запомни, что [факт]», и я сохраню это!';
    }
    const list = memories.map((m) => `• [${m.category}]: ${m.content}`).join('\n');
    return `🧠 Вот что я помню о тебе:\n\n${list}\n\nТы можешь добавить новое в любой момент!`;
  }

  if (trimmed === '/reset') {
    messages = [
      {
        id: `reset-${Date.now()}`,
        sender: 'agent',
        text: 'История текущего диалога очищена! Но всё из долговременной памяти сохранено. С чего начнем?',
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        source
      }
    ];
    return 'История диалога очищена. Я готова к новым темам!';
  }

  // Ask Gemini
  const response = await askPersonalAgent({
    userMessage: userText,
    agentName: agentConfig.name,
    agentRole: agentConfig.role,
    systemPrompt: agentConfig.systemPrompt,
    temperature: agentConfig.temperature,
    model: agentConfig.model,
    history: messages,
    memories
  });

  // If memory detected, add it
  if (response.extractedMemory) {
    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      category: response.extractedMemory.category,
      content: response.extractedMemory.content,
      addedAt: new Date().toLocaleDateString('ru-RU'),
      source: source === 'telegram' ? 'telegram' : 'auto_extracted'
    };
    memories.unshift(newMem);
  }

  return response.text;
}

// API: Get Full State
app.get('/api/agent', (req, res) => {
  const info = getBotInfo();
  agentConfig.telegramBot = {
    username: info.username || 'Milachudila_bot',
    firstName: info.first_name || 'Miu',
    id: info.id || 8996979262,
    isConnected: info.is_connected,
    lastPollTime: info.last_poll_time,
    updatesCount: info.updates_received_count,
    messagesSentCount: info.messages_sent_count,
    lastChatId: info.last_chat_id
  };

  res.json({
    agentConfig,
    messages,
    memories,
    geminiConnected: isGeminiConnected()
  });
});

// API: Chat message from Web Console
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const userMsg: ChatMessage = {
    id: `web-user-${Date.now()}`,
    sender: 'user',
    text: message.trim(),
    timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    source: 'web'
  };
  messages.push(userMsg);

  const replyText = await processAgentTurn(message.trim(), 'web');

  const agentMsg: ChatMessage = {
    id: `agent-${Date.now()}`,
    sender: 'agent',
    text: replyText,
    timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    source: 'web'
  };
  messages.push(agentMsg);

  // If user has chatted in Telegram before, we can also mirror to Telegram if desired
  res.json({
    reply: replyText,
    messages,
    memories
  });
});

// API: Update Agent Configuration
app.post('/api/agent/update', (req, res) => {
  const { name, role, systemPrompt, temperature, model, avatar } = req.body;
  if (name) agentConfig.name = name;
  if (role) agentConfig.role = role;
  if (systemPrompt) agentConfig.systemPrompt = systemPrompt;
  if (temperature !== undefined) agentConfig.temperature = Number(temperature);
  if (model) agentConfig.model = model;
  if (avatar) agentConfig.avatar = avatar;

  res.json({ agentConfig });
});

// API: Manage Memories
app.post('/api/memory/add', (req, res) => {
  const { content, category } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const item: MemoryItem = {
    id: `mem-${Date.now()}`,
    category: category || 'fact',
    content: content.trim(),
    addedAt: new Date().toLocaleDateString('ru-RU'),
    source: 'web'
  };
  memories.unshift(item);
  res.json({ memories });
});

app.delete('/api/memory/:id', (req, res) => {
  const { id } = req.params;
  memories = memories.filter((m) => m.id !== id);
  res.json({ memories });
});

// API: Clear Messages
app.post('/api/chat/clear', (req, res) => {
  messages = [
    {
      id: `init-${Date.now()}`,
      sender: 'agent',
      text: `История очищена! Я готова к новому диалогу. Чем могу помочь? 😊`,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      source: 'web'
    }
  ];
  res.json({ messages });
});

// API: Telegram Bot Status & Direct message
app.get('/api/telegram/status', (req, res) => {
  res.json(getBotInfo());
});

app.get('/api/gemini/status', (req, res) => {
  res.json({
    connected: isGeminiConnected(),
    model: agentConfig.model,
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY')
  });
});

app.post('/api/telegram/send', async (req, res) => {
  const { text } = req.body;
  const token = process.env.TELEGRAM_BOT_TOKEN || '8996979262:AAFyMShxryrXpJ39_QuKT0eTZQWdccV6w9U';
  const info = getBotInfo();

  if (!info.last_chat_id) {
    return res.status(400).json({
      error: 'Сначала напишите боту в Telegram хотя бы одно сообщение (например /start), чтобы получить ваш чат ID!'
    });
  }

  const ok = await sendMessageToTelegram(token, info.last_chat_id, text || 'Привет из веб-консоли агента!');
  if (ok) {
    messages.push({
      id: `sent-tg-${Date.now()}`,
      sender: 'agent',
      text: text || 'Привет из веб-консоли агента!',
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      source: 'web'
    });
  }
  res.json({ success: ok });
});

// Vite / static server
const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) {
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
    appType: 'spa'
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✨ Personal AI Agent is running on http://0.0.0.0:${PORT}`);

  // Auto-start live Telegram Bot polling
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '8996979262:AAFyMShxryrXpJ39_QuKT0eTZQWdccV6w9U';
  console.log(`[Telegram] Starting live polling with token: ${botToken.slice(0, 10)}...`);

  startTelegramPolling({
    token: botToken,
    onIncomingMessage: async (userText, chatId, fromName) => {
      console.log(`[Telegram] Received from ${fromName} (${chatId}): "${userText}"`);

      // Send typing action immediately to Telegram
      await sendTypingAction(botToken, chatId);

      // 1. Record incoming message
      const userMsg: ChatMessage = {
        id: `tg-${Date.now()}`,
        sender: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        source: 'telegram',
        chatId
      };
      messages.push(userMsg);

      // 2. Process with Gemini
      const replyText = await processAgentTurn(userText, 'telegram', chatId);

      // 3. Record agent reply
      const agentMsg: ChatMessage = {
        id: `agent-tg-${Date.now()}`,
        sender: 'agent',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        source: 'telegram',
        chatId
      };
      messages.push(agentMsg);

      return replyText;
    }
  });
});
