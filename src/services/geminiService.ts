import { GoogleGenAI } from '@google/genai';
import { ChatMessage, MemoryItem } from '../types/agent';

let aiClient: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    return aiClient;
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

export function isGeminiConnected(): boolean {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
}

export async function askPersonalAgent(params: {
  userMessage: string;
  agentName: string;
  agentRole: string;
  systemPrompt: string;
  temperature?: number;
  model?: string;
  history?: ChatMessage[];
  memories?: MemoryItem[];
}): Promise<{ text: string; extractedMemory?: { category: MemoryItem['category']; content: string } }> {
  const {
    userMessage,
    agentName,
    agentRole,
    systemPrompt,
    temperature = 0.7,
    model = 'gemini-2.5-flash',
    history = [],
    memories = []
  } = params;

  const client = getAiClient();

  // Format memories context
  const memoriesContext = memories.length > 0
    ? `\n\n[ТВОЯ ДОЛГОВРЕМЕННАЯ ПАМЯТЬ О ПОЛЬЗОВАТЕЛЕ]:\n` +
      memories.map((m) => `• [${m.category.toUpperCase()}]: ${m.content}`).join('\n')
    : '';

  const fullSystemInstruction = `${systemPrompt || `Ты — ${agentName}, преданный и умный персональный AI-ассистент пользователя. Твоя роль: ${agentRole}.`}
Ты общаешься с пользователем в Telegram и через веб-интерфейс.
Правила общения:
1. Будь живым, внимательным, полезным, дружелюбным и естественным собеседником.
2. Не веди себя как робот или бездушная справочная — проявляй эмпатию, интеллект и заботу.
3. Помни контекст разговора и используй информацию из своей долговременной памяти.
4. Отвечай на том языке, на котором пишет пользователь (по умолчанию — русский).
5. Если пользователь просит помочь с делами, кодом, текстом, идеями или жизненными вопросами — давай четкие, глубокие и качественные ответы.
6. В Telegram пиши структурированно, используй уместные эмодзи, выделяй важное.${memoriesContext}`;

  if (!client) {
    const fallback = generateFallbackReply(userMessage, agentName, memories);
    return { text: fallback };
  }

  try {
    // Build conversation context from recent messages (last 8)
    const recentMessages = history.slice(-8);
    let promptWithHistory = '';

    if (recentMessages.length > 0) {
      promptWithHistory += 'Контекст последних сообщений диалога:\n';
      for (const m of recentMessages) {
        promptWithHistory += `${m.sender === 'user' ? 'Пользователь' : agentName}: ${m.text}\n`;
      }
      promptWithHistory += `\nНовое сообщение пользователя:\n${userMessage}`;
    } else {
      promptWithHistory = userMessage;
    }

    const response = await client.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: promptWithHistory,
      config: {
        systemInstruction: fullSystemInstruction,
        temperature
      }
    });

    const replyText = response.text?.trim() || 'Я здесь и готов помочь! О чем поговорим?';

    // Check if user shared a memory/fact to save
    const extractedMemory = detectMemoryInText(userMessage);

    return {
      text: replyText,
      extractedMemory
    };
  } catch (error) {
    console.warn('Gemini generate error, using friendly fallback:', error);
    return {
      text: generateFallbackReply(userMessage, agentName, memories)
    };
  }
}

function detectMemoryInText(text: string): { category: MemoryItem['category']; content: string } | undefined {
  const lower = text.toLowerCase();
  if (lower.startsWith('запомни, что ') || lower.startsWith('запомни: ') || lower.startsWith('запомни ')) {
    const content = text.replace(/^запомни[,:]?\s*(что\s*)?/i, '').trim();
    if (content.length > 2) {
      return { category: 'fact', content };
    }
  }
  if (lower.includes('меня зовут ') || lower.includes('мое имя ')) {
    const match = text.match(/(?:меня зовут|мое имя)\s+([A-Za-zА-Яа-яЁё]+)/i);
    if (match && match[1]) {
      return { category: 'fact', content: `Имя пользователя: ${match[1]}` };
    }
  }
  if (lower.includes('моя цель ') || lower.includes('я хочу научиться ') || lower.includes('я планирую ')) {
    return { category: 'goal', content: text.trim() };
  }
  if (lower.includes('я люблю ') || lower.includes('мне нравится ') || lower.includes('я предпочитаю ')) {
    return { category: 'preference', content: text.trim() };
  }
  return undefined;
}

function generateFallbackReply(message: string, agentName: string, memories: MemoryItem[]): string {
  const lower = message.toLowerCase().trim();

  if (/^(привет|здравствуй|добрый день|доброе утро|добрый вечер|хай|салют|hello|hi)/i.test(lower)) {
    return `Привет! Рад тебя слышать! 😊 Я твой персональный агент ${agentName}. Чем могу помочь тебе прямо сейчас? Можем обсудить твои планы, решить задачу или просто поболтать.`;
  }

  if (lower.includes('кто ты') || lower.includes('что ты умеешь') || lower.includes('как дела')) {
    return `Я — ${agentName}, твой личный AI-помощник! 🚀 Я работаю на базе искусственного интеллекта и напрямую подключен к твоему Telegram-боту @Milachudila_bot.

Я умею:
• Общаться с тобой в Telegram и на этом сайте
• Запоминать важные факты, цели и твои предпочтения
• Помогать с идеями, текстами, кодом и планированием
• Быть на связи 24/7!

Напиши мне любую задачу или мысль!`;
  }

  if (lower.includes('что ты помнишь') || lower.includes('память')) {
    if (memories.length > 0) {
      const list = memories.map((m) => `• ${m.content}`).join('\n');
      return `Вот что я помню о тебе:\n${list}\n\nТы всегда можешь сказать мне «Запомни, что...», и я сохраню это!`;
    }
    return `Пока моя память чиста! Расскажи мне о себе или напиши: «Запомни, что [факт о тебе]», и я сохраню это навсегда.`;
  }

  return `Принял твоё сообщение: «${message}». Я внимательно слушаю тебя и готов помочь! Ты можешь продолжать писать мне здесь или прямо в Telegram (@Milachudila_bot).`;
}
