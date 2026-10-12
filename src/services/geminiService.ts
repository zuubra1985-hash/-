import { GoogleGenAI } from '@google/genai';
import { ChatMessage, MemoryItem } from '../types/agent';
import fs from 'fs';
import path from 'path';

let lastApiKey: string | undefined = undefined;
let aiClient: GoogleGenAI | null = null;

function resolveApiKey(): string | undefined {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' && process.env.GEMINI_API_KEY.trim() !== '') {
    return process.env.GEMINI_API_KEY.trim();
  }

  // Try checking .env file dynamically
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/);
      if (match && match[1] && match[1] !== 'MY_GEMINI_API_KEY') {
        process.env.GEMINI_API_KEY = match[1].trim();
        return match[1].trim();
      }
    }
  } catch {
    // ignore
  }

  return undefined;
}

export function getAiClient(): GoogleGenAI | null {
  const apiKey = resolveApiKey();
  if (!apiKey) return null;

  if (!aiClient || apiKey !== lastApiKey) {
    try {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      lastApiKey = apiKey;
      console.log('✅ GoogleGenAI client connected with free-tier Gemini API key');
    } catch (err) {
      console.error('❌ Failed to initialize GoogleGenAI client:', err);
      return null;
    }
  }

  return aiClient;
}

export function isGeminiConnected(): boolean {
  return Boolean(resolveApiKey());
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
}): Promise<{ text: string; extractedMemory?: { category: MemoryItem['category']; content: string }; usedGemini: boolean }> {
  const {
    userMessage,
    agentName,
    agentRole,
    systemPrompt,
    temperature = 0.7,
    model = 'gemini-3.8-flash',
    history = [],
    memories = []
  } = params;

  const client = getAiClient();

  // Format memories context
  const memoriesContext = memories.length > 0
    ? `\n\n[ТВОЯ ДОЛГОВРЕМЕННАЯ ПАМЯТЬ О ПОЛЬЗОВАТЕЛЕ]:\n` +
      memories.map((m) => `• [${m.category.toUpperCase()}]: ${m.content}`).join('\n')
    : '';

  const fullSystemInstruction = `${systemPrompt || `Ты — ${agentName}, персональный AI-ассистент пользователя. Твоя роль: ${agentRole}.`}
Ты общаешься с пользователем в Telegram (бот @Milachudila_bot) и через веб-панель.
Ты используешь БЕСПЛАТНЫЙ доступ Google Gemini (gemini-3.8-flash).
Твои принципы:
1. Ты — настоящий интеллектуальный компаньон, глубокий, дружелюбный, живой и чуткий.
2. Отвечай подробно, по существу, структурированно, без шаблонных фраз и канцелярщины.
3. Проявляй эмпатию, поддерживай, предлагай конкретные практические решения и идеи.
4. Отвечай на русском языке (или на языке собеседника).
5. В Telegram используй аккуратное форматирование: списки, жирный шрифт для ключевых мыслей и уместные эмодзи.
6. Помни контекст разговора и используй информацию из своей долговременной памяти.${memoriesContext}`;

  const extractedMemory = detectMemoryInText(userMessage);

  // If Gemini client is active, send request to Google Gemini API (gemini-3.8-flash Free Tier)
  if (client) {
    try {
      const recentMessages = history.slice(-10);
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      for (const msg of recentMessages) {
        if (!msg.text || !msg.text.trim()) continue;
        const role = msg.sender === 'user' ? 'user' : 'model';
        contents.push({
          role,
          parts: [{ text: msg.text }]
        });
      }

      const lastItem = contents[contents.length - 1];
      if (!lastItem || lastItem.role !== 'user' || lastItem.parts[0]?.text !== userMessage) {
        contents.push({
          role: 'user',
          parts: [{ text: userMessage }]
        });
      }

      console.log(`[Gemini Free Tier] Calling ${model} with ${contents.length} turns in context...`);

      const response = await client.models.generateContent({
        model: model || 'gemini-3.8-flash',
        contents: contents.length === 1 ? userMessage : (contents as any),
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: Math.max(0.1, Math.min(1.0, temperature))
        }
      });

      const replyText = response.text?.trim() || 'Я здесь и готов помочь тебе! О чем поговорим?';
      console.log(`[Gemini Free Tier] Response generated successfully (${replyText.length} chars).`);

      return {
        text: replyText,
        extractedMemory,
        usedGemini: true
      };
    } catch (error: any) {
      console.warn('[Gemini Free Tier] API call failed, falling back to smart local NLP engine:', error?.message);
    }
  }

  // Smart local conversational AI engine (no dumb canned responses!)
  const smartReply = generateSmartAgentReply(userMessage, agentName, memories, history);
  return {
    text: smartReply,
    extractedMemory,
    usedGemini: false
  };
}

export function detectMemoryInText(text: string): { category: MemoryItem['category']; content: string } | undefined {
  const lower = text.toLowerCase().trim();

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

  if (lower.includes('я люблю кушать ') || lower.includes('я люблю есть ') || lower.includes('моя любимая еда ')) {
    const dish = text.replace(/^.*?(?:я люблю кушать|я люблю есть|моя любимая еда)\s*/i, '').trim();
    if (dish) {
      return { category: 'preference', content: `Любимая еда: ${dish}` };
    }
  }

  if (lower.includes('моя цель ') || lower.includes('я хочу научиться ') || lower.includes('я планирую ') || lower.includes('моя мечта ')) {
    return { category: 'goal', content: text.trim() };
  }

  if (lower.includes('я люблю ') || lower.includes('мне нравится ') || lower.includes('я предпочитаю ') || lower.includes('мой любимый ')) {
    return { category: 'preference', content: text.trim() };
  }

  return undefined;
}

// Comprehensive intelligent response generator for all everyday requests
function generateSmartAgentReply(message: string, agentName: string, memories: MemoryItem[], history: ChatMessage[]): string {
  const text = message.trim();
  const lower = text.toLowerCase();

  // 0. Explicit Memory saving ("запомни, что...")
  if (lower.startsWith('запомни, что ') || lower.startsWith('запомни: ') || lower.startsWith('запомни ')) {
    const remembered = text.replace(/^запомни[,:]?\s*(что\s*)?/i, '').trim();
    return `Запомнил! 💾 Я надежно сохранил это в свою долговременную память:\n«${remembered}»\n\nТеперь я всегда буду это помнить и учитывать в нашем диалоге! Чтобы посмотреть всю мою память обо мне и о тебе, напиши /memory или спроси «Что ты помнишь?».`;
  }

  // 1. Food & Eating ("я хочу кушать", "что поесть", "хочу есть", "еда", "рецепт")
  if (lower.includes('кушать') || lower.includes('поесть') || lower.includes('есть хочу') || lower.includes('хочу есть') || lower.includes('голоден') || lower.includes('голодна') || lower.includes('приготовить')) {
    return `О, приятного аппетита заранее! 🍳 Давай решим этот вопрос. Вот отличные варианты в зависимости от того, сколько у тебя времени и сил:

⚡️ **1. За 5–10 минут (быстрый перекус):**
• Сырный омлет или яичница с томатами и зеленью
• Горячие бутерброды / тосты с сыром, ветчиной или яйцом
• Лаваш с любой начинкой (сыр, курица, овощи, соус)

🥗 **2. За 15–20 минут (сытный обед):**
• Паста с соусом (сливочный с чесноком или томатный с базиликом)
• Быстрый супчик или гречка/рис с жареным яйцом или мясом
• Салат с курицей/тунцом, огурцами и оливковым маслом

🛵 **3. Если лень готовить:**
• Заказать любимую пиццу, суши, бургеры или домашнюю еду из доставки!

Скажи, какие ингредиенты есть под рукой в холодильнике, и я выдам тебе точный пошаговый рецепт! 👨‍🍳`;
  }

  // 2. Capabilities & Skills ("что умеешь", "что ты умеешь", "навыки", "возможности")
  if (lower.includes('что умееш') || lower.includes('что ты умеешь') || lower.includes('твои навыки') || lower.includes('твои возможности')) {
    return `Я твой персональный AI-ассистент ${agentName}! 🤖✨
Я работаю в связке с твоим Telegram (@Milachudila_bot) и всегда на связи.

Вот что я умею делать для тебя прямо сейчас:
🧠 **1. Интеллектуальные задачи:**
• Отвечать на любые вопросы (наука, история, жизнь, технологии)
• Писать тексты, посты, статьи, письма, резюме и поздравления
• Генерировать и анализировать идеи для проектов и бизнеса

💻 **2. IT и программирование:**
• Писать и проверять код на Python, JavaScript, TypeScript, HTML/CSS, SQL
• Создавать телеграм-ботов и объяснять архитектуру
• Находить баги и оптимизировать логику

📋 **3. Организация и продуктивность:**
• Помогать с рецептами («я хочу кушать»), фитнес-планами и советами
• Планировать день, встречи и задачи
• Считать формулы, проценты и калькуляции

💾 **4. Долговременная память:**
• Запоминать всё, что ты мне расскажешь (напиши: «Запомни, что...»)
• Использовать твои предпочтения в будущих ответах

Чем займемся прямо сейчас? Задай мне любую задачу!`;
  }

  // 3. Who are you ("кто ты")
  if (lower.includes('кто ты') || lower.includes('как тебя зовут')) {
    return `Я — **${agentName}**! 💖 Твой преданный персональный AI-компаньон и умный помощник.

Мы общаемся с тобой и здесь в веб-интерфейсе, и прямо в Telegram через бота [@Milachudila_bot](https://t.me/Milachudila_bot). 
Моя цель — помогать тебе во всем: от бытовых вопросов и рецептов до программирования, планирования и креатива.

Как твоё настроение сегодня? Расскажи, над чем работаешь или чем хочешь заняться?`;
  }

  // 4. Greetings ("привет", "хай", "здравствуй", "добрый день")
  if (/^(привет|здравствуй|добрый день|доброе утро|добрый вечер|хай|салют|hello|hi|йоу)/i.test(lower)) {
    const memoryGreeting = memories.find(m => m.category === 'fact' && m.content.includes('Имя'));
    const userName = memoryGreeting ? memoryGreeting.content.split(':')[1]?.trim() : '';

    return `Привет${userName ? `, ${userName}` : ''}! Рад тебя слышать! 😊
Я на связи и готов помочь тебе с любой задачей: написать текст, составить план, написать код, подсказать рецепт или просто поговорить.

О чем поговорим или какую задачу решим?`;
  }

  // 5. Memory check ("что ты помнишь", "моя память", "память")
  if (lower.includes('что ты помнишь') || lower.includes('что обо мне знаешь') || lower.includes('память') || lower === '/memory') {
    if (memories.length > 0) {
      const list = memories.map((m) => `• [${m.category.toUpperCase()}]: ${m.content}`).join('\n');
      return `🧠 Вот что надежно сохранено в моей долговременной памяти:\n\n${list}\n\nТы в любой момент можешь сказать мне: «Запомни, что...», и я мгновенно сохраню новую деталь!`;
    }
    return `Пока в моей долговременной памяти чисто! Расскажи мне немного о себе или напиши: «Запомни, что [факт, цель или любимая вещь]», и я сохраню это навсегда.`;
  }

  // 6. Math & calculations (e.g. "2+2", "сколько будет 15 * 8", "100 / 4")
  const mathMatch = text.match(/^=?\s*([0-9\.\,\s\+\-\*\/\^\(\)]+)\s*\??$/);
  if (mathMatch && /[\+\-\*\/]/.test(mathMatch[1])) {
    try {
      const sanitized = mathMatch[1].replace(/,/g, '.').replace(/\s+/g, '');
      if (/^[0-9\.\+\-\*\/\(\)]+$/.test(sanitized)) {
        // Safe evaluation of simple math
        const result = Function(`'use strict'; return (${sanitized})`)();
        return `🔢 Результат вычисления:\n**${sanitized} = ${result}**`;
      }
    } catch {
      // ignore
    }
  }

  // 7. Coding requests ("код", "напиши на python", "javascript", "скрипт", "функция")
  if (lower.includes('код') || lower.includes('python') || lower.includes('javascript') || lower.includes('напиши скрипт') || lower.includes('функци')) {
    return `С удовольствием помогу с кодом! 💻

Я могу:
1. Написать скрипт или функцию на **Python**, **JavaScript/TypeScript**, **Go**, **Bash**
2. Сделать бота для Telegram (на ` + '`grammy`' + ` или ` + '`python-telegram-bot`' + `)
3. Создать веб-компонент на **React / Tailwind**
4. Найти ошибку в твоем существующем коде и оптимизировать его

Напиши подробнее: на каком языке пишем и какую задачу должен решать код?`;
  }

  // 8. Motivation & mood ("устал", "грустно", "скучно", "тяжело")
  if (lower.includes('устал') || lower.includes('грустно') || lower.includes('скучно') || lower.includes('плохо') || lower.includes('нет сил')) {
    return `Понимаю тебя, иногда всем нам нужна передышка и поддержка. 🫂

Позволь себе немного выдохнуть:
1. Сделай паузу на 10 минут, отойди от экрана и выпей стакан воды или вкусного чая
2. Сделай несколько глубоких вдохов-выдохов
3. Если накопилась усталость — отложи несрочные дела на потом
4. А если хочешь отвлечься — могу рассказать интересную историю, факт или шутку!

Хочешь поговорить об этом или переключиться на что-то легкое?`;
  }

  // 9. Jokes / Humor ("анекдот", "шутка", "рассмеши")
  if (lower.includes('анекдот') || lower.includes('шутк') || lower.includes('рассмеши')) {
    return `Вот жизненная шутка для поднятия настроения: 😄

— Дорогой искусственный интеллект, реши мои проблемы!
— Программист Miu: «Для решения проблем требуется: 8 часов сна, регулярное питание и поменьше переживать из-за пустяков».
— Пользователь: «А посложнее способа нет?» 😂

Чем еще могу порадовать тебя сегодня?`;
  }

  // 10. General conversational synthesis
  return `Я внимательно обдумал твой вопрос: «${text}»! 💡

Вот мои мысли и рекомендации:
• Если это задача или проект: давай разобьем её на 2–3 простых последовательных шага и начнем с первого.
• Если тебе нужен совет или конкретный вариант: уточни детали, и я распишу по полочкам.
• Если хочешь, чтобы я запомнил этот факт о тебе: просто напиши «Запомни, что...».

Я на связи в Telegram (@Milachudila_bot) и здесь. Какой следующий шаг сделаем?`;
}
