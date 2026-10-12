import fs from 'fs';
import path from 'path';
import { ChatMessage, MemoryItem } from '../types/agent';

let cachedApiKey: string | undefined = undefined;

export function resolveOpenRouterApiKey(): string | undefined {
  if (
    process.env.OPENROUTER_API_KEY &&
    process.env.OPENROUTER_API_KEY !== 'MY_OPENROUTER_API_KEY' &&
    process.env.OPENROUTER_API_KEY.trim() !== ''
  ) {
    return process.env.OPENROUTER_API_KEY.trim();
  }

  // Check .env dynamically
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/OPENROUTER_API_KEY=["']?([^"'\r\n]+)["']?/);
      if (match && match[1] && match[1] !== 'MY_OPENROUTER_API_KEY') {
        process.env.OPENROUTER_API_KEY = match[1].trim();
        return match[1].trim();
      }
    }
  } catch {
    // ignore
  }

  return undefined;
}

export function isOpenRouterConnected(): boolean {
  return Boolean(resolveOpenRouterApiKey());
}

export function saveOpenRouterApiKey(apiKey: string): boolean {
  try {
    const cleanKey = apiKey.trim();
    process.env.OPENROUTER_API_KEY = cleanKey;
    cachedApiKey = cleanKey;

    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    if (envContent.includes('OPENROUTER_API_KEY=')) {
      envContent = envContent.replace(/OPENROUTER_API_KEY=.*/g, `OPENROUTER_API_KEY="${cleanKey}"`);
    } else {
      envContent += `\nOPENROUTER_API_KEY="${cleanKey}"\n`;
    }
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ OpenRouter API key saved to .env and environment');
    return true;
  } catch (err) {
    console.error('❌ Failed to save OpenRouter API key:', err);
    return false;
  }
}

export interface OpenRouterCallParams {
  model: string;
  systemPrompt: string;
  userMessage: string;
  history?: ChatMessage[];
  memories?: MemoryItem[];
  temperature?: number;
}

export async function callOpenRouter(params: OpenRouterCallParams): Promise<{ text: string; modelUsed: string; cost?: number }> {
  const apiKey = resolveOpenRouterApiKey();
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured');
  }

  const {
    model = 'deepseek/deepseek-chat',
    systemPrompt,
    userMessage,
    history = [],
    memories = [],
    temperature = 0.7
  } = params;

  // Format memories context
  const memoriesContext = memories.length > 0
    ? `\n\n[ТВОЯ ДОЛГОВРЕМЕННАЯ ПАМЯТЬ О ПОЛЬЗОВАТЕЛЕ]:\n` +
      memories.map((m) => `• [${m.category.toUpperCase()}]: ${m.content}`).join('\n')
    : '';

  const fullSystem = `${systemPrompt}${memoriesContext}`;

  // Build messages array
  const openRouterMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: fullSystem }
  ];

  // Include recent conversation turns
  const recentHistory = history.slice(-10);
  for (const msg of recentHistory) {
    if (!msg.text || !msg.text.trim()) continue;
    openRouterMessages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    });
  }

  // Ensure current user message is at the end
  const lastMsg = openRouterMessages[openRouterMessages.length - 1];
  if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== userMessage) {
    openRouterMessages.push({
      role: 'user',
      content: userMessage
    });
  }

  console.log(`[OpenRouter] Requesting model "${model}" with ${openRouterMessages.length} messages...`);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://aistudio.google.com',
      'X-Title': 'Miu Personal Agent',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: openRouterMessages,
      temperature: Math.max(0.1, Math.min(1.2, temperature))
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[OpenRouter Error] HTTP ${response.status}:`, errText);
    throw new Error(`OpenRouter returned HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const replyText = data.choices?.[0]?.message?.content?.trim();

  if (!replyText) {
    throw new Error('OpenRouter returned an empty response');
  }

  const cost = data.usage?.cost;
  console.log(`[OpenRouter Success] Generated ${replyText.length} chars (model: ${data.model || model}, cost: $${cost || 0})`);

  return {
    text: replyText,
    modelUsed: data.model || model,
    cost
  };
}
