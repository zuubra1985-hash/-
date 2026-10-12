import { GoogleGenAI } from '@google/genai';
import { ChatMessage, MemoryItem } from '../types/agent';
import {
  callOpenRouter,
  isOpenRouterConnected,
  saveOpenRouterApiKey,
  resolveOpenRouterApiKey
} from './openRouterService';
import fs from 'fs';
import path from 'path';

let lastApiKey: string | undefined = undefined;
let aiClient: GoogleGenAI | null = null;

export function resolveApiKey(): string | undefined {
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

export function saveGeminiApiKey(apiKey: string): boolean {
  try {
    const clean = apiKey.trim();
    process.env.GEMINI_API_KEY = clean;
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    if (envContent.includes('GEMINI_API_KEY=')) {
      envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY="${clean}"`);
    } else {
      envContent += `\nGEMINI_API_KEY="${clean}"\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');
    aiClient = null;
    lastApiKey = undefined;
    getAiClient();
    return true;
  } catch (err) {
    console.error('Failed to save Gemini API key:', err);
    return false;
  }
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

export function isAnyAiConnected(): boolean {
  return isOpenRouterConnected() || isGeminiConnected();
}

export function getActiveAiProviderInfo(): { provider: string; model: string; connected: boolean } {
  if (isOpenRouterConnected()) {
    return { provider: 'OpenRouter', model: 'deepseek/deepseek-chat', connected: true };
  }
  if (isGeminiConnected()) {
    return { provider: 'Google Gemini', model: 'gemini-3.8-flash', connected: true };
  }
  return { provider: 'Local Engine', model: 'offline', connected: false };
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
}): Promise<{ text: string; extractedMemory?: { category: MemoryItem['category']; content: string }; usedAI: boolean; provider?: string }> {
  const {
    userMessage,
    agentName,
    agentRole,
    systemPrompt,
    temperature = 0.7,
    model = 'deepseek/deepseek-chat',
    history = [],
    memories = []
  } = params;

  // 1. Detect if the user pasted an OpenRouter key in the chat
  const openRouterKeyMatch = userMessage.match(/(sk-or-v1-[a-f0-9]{64})/i);
  if (openRouterKeyMatch) {
    const key = openRouterKeyMatch[1];
    saveOpenRouterApiKey(key);
    return {
      text: `🎉 **Ключ OpenRouter успешно подключен и сохранен!**\n\nМодель по умолчанию: **DeepSeek Chat** (ультрадешевая, быстрая и умная модель всего ~$0.14 за 1 000 000 токенов).\n\nТеперь я отвечаю через настоящий искусственный интеллект без шаблонов и ограничений! Спроси меня о чем угодно — о рецептах, планах на день, коде или идеях! 🚀`,
      usedAI: true,
      provider: 'OpenRouter'
    };
  }

  // 2. Detect if the user pasted a Google Gemini key in the chat
  const geminiKeyMatch = userMessage.match(/(AIza[0-9A-Za-z-_]{35})/);
  if (geminiKeyMatch) {
    const key = geminiKeyMatch[1];
    saveGeminiApiKey(key);
    return {
      text: `🎉 **Ключ Google Gemini API успешно подключен!**\n\nТеперь я использую модель **Gemini 3.8 Flash** на бесплатном тарифе! Все ответы генерируются нейросетью в реальном времени. С чего начнем? 🌟`,
      usedAI: true,
      provider: 'Google Gemini'
    };
  }

  const extractedMemory = detectMemoryInText(userMessage);

  const memoriesContext = memories.length > 0
    ? `\n\n[ТВОЯ ДОЛГОВРЕМЕННАЯ ПАМЯТЬ О ПОЛЬЗОВАТЕЛЕ]:\n` +
      memories.map((m) => `• [${m.category.toUpperCase()}]: ${m.content}`).join('\n')
    : '';

  const fullSystemInstruction = `${systemPrompt || `Ты — ${agentName}, преданный персональный AI-ассистент пользователя. Твоя роль: ${agentRole}.`}
Ты общаешься с пользователем в Telegram (бот @Milachudila_bot) и через веб-панель.
Твои принципы:
1. Ты — настоящий живой интеллектуальный компаньон, глубокий, дружелюбный, чуткий и внимательный к деталям.
2. Отвечай подробно, по существу, без шаблонных фраз и канцелярщины.
3. Проявляй эмпатию, поддерживай собеседника, предлагай конкретные практические решения и варианты.
4. Отвечай на русском языке (или на языке собеседника).
5. В Telegram используй аккуратное оформление: списки, жирный шрифт для ключевых мыслей и уместные эмодзи.
6. Помни контекст разговора и используй информацию из своей долговременной памяти.${memoriesContext}`;

  // 3. PRIORITY 1: OpenRouter (e.g. DeepSeek, Qwen, Llama, Gemini via OpenRouter)
  if (isOpenRouterConnected()) {
    try {
      // Determine model to use
      let effectiveModel = model;
      if (!effectiveModel || effectiveModel.startsWith('gemini-3.')) {
        // Default to deepseek/deepseek-chat as the ultra-cheap and brilliant model on OpenRouter
        effectiveModel = 'deepseek/deepseek-chat';
      }

      console.log(`[AI Provider] Calling OpenRouter with model "${effectiveModel}"...`);
      const orResult = await callOpenRouter({
        model: effectiveModel,
        systemPrompt: fullSystemInstruction,
        userMessage,
        history,
        memories,
        temperature
      });

      return {
        text: orResult.text,
        extractedMemory,
        usedAI: true,
        provider: `OpenRouter (${orResult.modelUsed})`
      };
    } catch (err: any) {
      console.warn('[OpenRouter] Call failed:', err?.message);
    }
  }

  // 4. PRIORITY 2: Direct Google Gemini SDK if Gemini key is available
  const client = getAiClient();
  if (client) {
    try {
      const recentMessages = history.slice(-10);
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      for (const msg of recentMessages) {
        if (!msg.text || !msg.text.trim()) continue;
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
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

      const geminiModel = model.includes('/') ? 'gemini-3.8-flash' : model;
      console.log(`[Gemini SDK] Calling ${geminiModel}...`);

      const response = await client.models.generateContent({
        model: geminiModel,
        contents: contents.length === 1 ? userMessage : (contents as any),
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: Math.max(0.1, Math.min(1.0, temperature))
        }
      });

      const replyText = response.text?.trim() || 'Я здесь и готов помочь тебе! О чем поговорим?';
      return {
        text: replyText,
        extractedMemory,
        usedAI: true,
        provider: 'Google Gemini'
      };
    } catch (error: any) {
      console.warn('[Gemini SDK] Call failed:', error?.message);
    }
  }

  // 5. Fallback: Detailed, high-quality responses if neither key is active
  const smartReply = generateSmartAgentReply(userMessage, agentName, memories, history);
  return {
    text: smartReply,
    extractedMemory,
    usedAI: false,
    provider: 'Local Engine'
  };
}

export function detectMemoryInText(text: string): { category: MemoryItem['category']; content: string } | undefined {
  const lower = text.toLowerCase().trim();

  // Pattern: "запомни, что..."
  const rememberMatch = text.match(/запомни[,:]?\s*(?:что\s*)?(.+)/i);
  if (rememberMatch && rememberMatch[1]) {
    const rawContent = rememberMatch[1].trim();
    if (rawContent.length > 2) {
      let category: MemoryItem['category'] = 'fact';
      if (/цель|хочу достичь|планирую|мечтаю/i.test(rawContent)) category = 'goal';
      if (/люблю|обожаю|предпочитаю|не люблю|терпеть не могу|мой любимый/i.test(rawContent)) category = 'preference';
      if (/всегда|никогда|правило|отвечай/i.test(rawContent)) category = 'instruction';
      return { category, content: rawContent };
    }
  }

  // Auto-detect names: "меня зовут..."
  const nameMatch = text.match(/(?:меня зовут|мое имя|моё имя|я -|я —)\s+([А-Яа-яA-Za-z]+)/i);
  if (nameMatch && nameMatch[1]) {
    return {
      category: 'fact',
      content: `Имя пользователя: ${nameMatch[1].trim()}`
    };
  }

  return undefined;
}

// Comprehensive intelligent response generator for offline fallback
function generateSmartAgentReply(message: string, agentName: string, memories: MemoryItem[], history: ChatMessage[]): string {
  const text = message.trim();
  const lower = text.toLowerCase();

  // 0. Explicit Memory saving ("запомни, что...")
  if (lower.startsWith('запомни, что ') || lower.startsWith('запомни: ') || lower.startsWith('запомни ')) {
    const remembered = text.replace(/^запомни[,:]?\s*(что\s*)?/i, '').trim();
    return `Запомнил! 💾 Я надежно сохранил это в свою долговременную память:\n«${remembered}»\n\nТеперь я всегда буду это помнить и учитывать в нашем диалоге! Чтобы посмотреть всю мою память, напиши команду /memory.`;
  }

  // 1. Pizza / "Найди пиццу"
  if (lower.includes('пицц') || lower.includes('найди пицу')) {
    return `Вот отличные способы найти и заказать вкусную пиццу прямо сейчас! 🍕

🛵 **1. Экспресс-доставка (быстрее всего):**
• **Яндекс Еда / Деливери / Самокат** — введи «пицца», отсортируй по рейтингу 4.8+ и времени доставки до 30-40 минут.
• **Додо Пицца / Папа Джонс / Доминос** — классика с быстрой собственной доставкой и отслеживанием на карте.

🇮🇹 **2. Если хочется настоящую неаполитанскую (на тонком тесте с пышными бортиками):**
• Открой Яндекс Карты или 2ГИС, введи **«пиццерия с дровяной печью»** или **«пицца napoletana»** — там будет аутентичный вкус из печи!

👨‍🍳 **3. Или хочешь приготовить домашнюю за 15 минут?**
Напиши мне «Рецепт пиццы Маргарита» или «Как сделать тесто для пиццы», и я распишу пошагово!`;
  }

  // 2. Margarita Recipe (Pizza or Cocktail)
  if (lower.includes('маргарит')) {
    return `Классическая **Маргарита** бывает двух видов — выбирай, что приготовим! 🍕🍹

━━━━━━━━━━━━━━━━━━━━
🍕 **1. КЛАССИЧЕСКАЯ ПИЦЦА «МАРГАРИТА» (Неаполитанская):**
**Ингредиенты:**
• Тесто для пиццы (мука, вода, дрожжи, соль, оливковое масло) — 250 г
• Протертые томаты в собственном соку (Pelati) — 80-100 г
• Свежая моцарелла (Fior di Latte или Burrata) — 120 г
• Листья свежего базилика — 5-6 шт.
• Оливковое масло Extra Virgin — 1 ст. ложка
• Щепотка морской соли

**Приготовление (10-12 минут):**
1. Разогрей духовку на максимум (250°C, идеально с противнем внутри).
2. Растяни тесто руками от центра к краям, оставляя пышный бортик 1.5–2 см.
3. Равномерно нанеси томатный соус круговыми движениями.
4. Выложи кусочки моцареллы (слегка отожми лишнюю влагу салфеткой).
5. Сбрызни оливковым маслом и отправь в духовку на 8–10 минут до золотистых пузырьков на бортиках.
6. При подаче укрась свежими листьями базилика! 🌿

━━━━━━━━━━━━━━━━━━━━
🍹 **2. ЛЕГЕНДАРНЫЙ КОКТЕЙЛЬ «МАРГАРИТА»:**
**Пропорция 5:3:2 (IBA Classic):**
• Серебряная текила — 50 мл
• Апельсиновый ликер (Cointreau / Triple Sec) — 30 мл
• Свежевыжатый сок лайма — 20 мл
• Лед в кубиках
• Крупная соль и долька лайма для каемки бокала

**Приготовление:**
1. Проведи долькой лайма по краю бокала и опусти в соль для соленой каемки.
2. В шейкер добавь лед, текилу, ликер и сок лайма.
3. Встряхивай 15 секунд и перелей через ситечко в бокал.`;
  }

  // 3. Day Planning & Priorities
  if (lower.includes('план') || lower.includes('приоритет') || lower.includes('распорядок') || lower.includes('тайм')) {
    return `Давай составим мощный, четкий и реалистичный план на день по проверенной методике **1-3-5 + Timeboxing**! 🎯

📋 **Структура твоего дня:**

🌟 **1. ГЛАВНЫЙ ФОКУС ДНЯ (Правило 1 крупного дела):**
• *Выбери ровно одну задачу, сделав которую, ты сможешь уверенно сказать: «День прошел не зря!»*
*(Поставь её на первую половину дня, пока уровень ментальной энергии максимален).*

🔹 **2. ТРИ СРЕДНИЕ ВАЖНЫЕ ЗАДАЧИ:**
• Задача №1: _____________________ (до обеда)
• Задача №2: _____________________ (после обеда)
• Задача №3: _____________________ (во второй половине дня)

📎 **3. ПЯТЬ МЕЛКИХ РУТИННЫХ ДЕЛ (по 10–15 минут):**
• Ответить на письма и сообщения
• Оплата счетов / звонки
• Короткая разминка или прогулка
• Уборка рабочего места
• Подведение итогов перед сном

💡 **Секрет успеха:** работай блоками «Помидора» (45 минут фокуса без соцсетей + 10 минут отдыха).
Напиши мне список того, что висит над душой, и я помогу отсортировать по приоритетам! ⚡️`;
  }

  // 4. Food & Recipes general
  if (lower.includes('кушать') || lower.includes('поесть') || lower.includes('голоден') || lower.includes('рецепт') || lower.includes('приготов')) {
    return `О, приятного аппетита! 🍳 Вот несколько идей в зависимости от времени:

⚡️ **За 10 минут:**
• Сырный омлет с томатами и зеленью
• Горячие хрустящие тосты с сыром и ветчиной
• Лаваш с сыром сулугуни, курицей и соусом

🥗 **За 20 минут:**
• Паста с соусом из томатов, чеснока и базилика
• Салат с тунцом, яйцом, огурцом и оливковым маслом
• Куриное филе на сковороде-гриль с овощами

Напиши, какие продукты есть дома, и я составлю блюдо именно из них!`;
  }

  // 5. Capabilities
  if (lower.includes('что умееш') || lower.includes('что ты умеешь') || lower.includes('навыки')) {
    return `Я твой персональный AI-ассистент ${agentName}! 🤖✨
Я работаю в Telegram (@Milachudila_bot) и в веб-панеле.

Вот чем я занимаюсь:
• **Отвечаю на любые вопросы:** от науки и IT до бытовых советов и рецептов
• **Пишу и отлаживаю код:** Python, JS/TS, Telegram-боты, React, SQL
• **Планирую дела:** помогаю расставлять приоритеты и организовывать время
• **Помню важное:** храню твои предпочтения в долговременной памяти (/memory)
• **Поддерживаю:** генерирую креативные идеи, тексты, посты и планы

Какую задачу решим прямо сейчас?`;
  }

  // 6. Who are you
  if (lower.includes('кто ты') || lower.includes('как тебя зовут')) {
    return `Я — **${agentName}**! 💖 Твой преданный персональный AI-компаньон.
Мы общаемся с тобой и здесь, и в Telegram через [@Milachudila_bot](https://t.me/Milachudila_bot). 
Я готова помогать в любых вопросах и делах! Чем займемся?`;
  }

  // 7. Greetings
  if (/^(привет|здравствуй|добрый день|доброе утро|добрый вечер|хай|салют|hello|hi)/i.test(lower)) {
    return `Привет! Рад тебя слышать! 😊
Я на связи и готов помочь тебе: составить план, написать код, подсказать рецепт или просто поболтать. 

О чем поговорим сегодня?`;
  }

  // 8. Default thoughtful response
  return `Отличная тема для разбора! 💡

По вопросу «${text}»:
1. Давай выделим главное направление и ключевую цель.
2. Если нужно составить пошаговый план или решение — уточни, в каком формате тебе удобнее (кратко тезисами или подробно).
3. Я готова сразу подключиться и выдать детальный результат!

Как продолжим? 🚀`;
}
