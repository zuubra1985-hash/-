export interface TelegramBotInfo {
  id: number;
  first_name: string;
  username: string;
  is_connected: boolean;
  last_poll_time?: string;
  updates_received_count: number;
  messages_sent_count: number;
  last_chat_id?: number | string;
  error?: string;
}

let botInfo: TelegramBotInfo = {
  id: 8996979262,
  first_name: 'Miu',
  username: 'Milachudila_bot',
  is_connected: false,
  updates_received_count: 0,
  messages_sent_count: 0
};

let pollingActive = false;
let lastUpdateId = 0;

export function getBotInfo(): TelegramBotInfo {
  return botInfo;
}

// Split long text into Telegram-friendly chunks (max 4000 characters)
function splitTextChunks(text: string, maxLength = 4000): string[] {
  if (text.length <= maxLength) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }
    let splitIdx = remaining.lastIndexOf('\n', maxLength);
    if (splitIdx === -1 || splitIdx < maxLength / 2) {
      splitIdx = maxLength;
    }
    chunks.push(remaining.substring(0, splitIdx));
    remaining = remaining.substring(splitIdx).trimStart();
  }
  return chunks;
}

export async function sendMessageToTelegram(
  token: string,
  chatId: number | string,
  text: string,
  buttons?: { label: string; action: string }[]
): Promise<boolean> {
  try {
    const chunks = splitTextChunks(text, 3900);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const isLast = i === chunks.length - 1;

      const payload: any = {
        chat_id: chatId,
        text: chunk
      };

      // Add buttons only to the final chunk
      if (isLast && buttons && buttons.length > 0) {
        payload.reply_markup = {
          inline_keyboard: buttons.slice(0, 5).map((b) => [
            { text: b.label, callback_data: b.action.slice(0, 64) }
          ])
        };
      }

      // First attempt: try without formatting or markdown to prevent parsing drops
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data: any = await response.json();
      if (data.ok) {
        botInfo.messages_sent_count += 1;
      } else {
        console.warn(`[Telegram] Send message attempt warning:`, data);
        // Retry with plain text and no reply_markup if that caused issues
        delete payload.reply_markup;
        const retryRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const retryData: any = await retryRes.json();
        if (retryData.ok) {
          botInfo.messages_sent_count += 1;
        } else {
          console.error(`[Telegram] Send failed completely:`, retryData);
          return false;
        }
      }
    }
    return true;
  } catch (err: any) {
    console.error('[Telegram] Failed to send message exception:', err);
    botInfo.error = err?.message || 'Network send error';
    return false;
  }
}

// Register native commands in Telegram
async function registerBotCommands(token: string) {
  try {
    const commands = [
      { command: 'start', description: 'Главное меню Master Agent' },
      { command: 'status', description: 'Состояние фабрики и метрики' },
      { command: 'agents', description: 'Список специализированных агентов' },
      { command: 'tasks', description: 'История задач и пайплайнов' },
      { command: 'memory', description: '7-уровневая проверенная память' },
      { command: 'errors', description: 'База ошибок и Root Cause Analysis' },
      { command: 'improve', description: 'Запуск оптимизатора агента' },
      { command: 'test', description: 'Запуск тестового набора' },
      { command: 'evolve', description: 'Автономный цикл эволюции' }
    ];

    await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands })
    });
    console.log('[Telegram] Native bot commands registered successfully.');
  } catch (err) {
    console.warn('[Telegram] Could not register commands:', err);
  }
}

export function startTelegramPolling(params: {
  token: string;
  onIncomingMessage: (
    userText: string,
    chatId: number | string,
    fromName: string
  ) => Promise<string | { replyText: string; buttons?: { label: string; action: string }[] }>;
}) {
  if (pollingActive) {
    console.log('[Telegram] Polling is already active.');
    return;
  }
  pollingActive = true;

  const { token, onIncomingMessage } = params;

  // 1. Initial bot validation & registration
  fetch(`https://api.telegram.org/bot${token}/getMe`)
    .then((res) => res.json())
    .then((data: any) => {
      if (data.ok && data.result) {
        botInfo = {
          ...botInfo,
          id: data.result.id,
          first_name: data.result.first_name,
          username: data.result.username,
          is_connected: true,
          error: undefined
        };
        console.log(`[Telegram] ✅ Bot connected: @${data.result.username} (ID: ${data.result.id})`);
        registerBotCommands(token);
      } else {
        botInfo.is_connected = false;
        botInfo.error = data.description || 'Invalid token';
        console.error('[Telegram] ❌ getMe failed:', data);
      }
    })
    .catch((err) => {
      botInfo.is_connected = false;
      botInfo.error = err.message;
      console.error('[Telegram] ❌ getMe network error:', err);
    });

  // 2. Continuous long polling loop
  const poll = async () => {
    console.log('[Telegram] 🚀 Long polling loop started.');
    while (pollingActive) {
      try {
        botInfo.last_poll_time = new Date().toLocaleTimeString('ru-RU');
        const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=15`;
        const res = await fetch(url);
        const data: any = await res.json();

        if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
          for (const update of data.result) {
            lastUpdateId = Math.max(lastUpdateId, update.update_id);
            botInfo.updates_received_count += 1;

            let incomingText = '';
            let chatId: number | string = '';
            let fromName = 'Пользователь Telegram';

            if (update.message) {
              incomingText = update.message.text || update.message.caption || '';
              chatId = update.message.chat.id;
              fromName =
                update.message.from?.first_name ||
                update.message.from?.username ||
                'Пользователь';
            } else if (update.callback_query && update.callback_query.data) {
              incomingText = update.callback_query.data;
              chatId = update.callback_query.message?.chat?.id || update.callback_query.from.id;
              fromName =
                update.callback_query.from?.first_name ||
                update.callback_query.from?.username ||
                'Пользователь';

              // Answer callback query to remove spinner in Telegram
              try {
                await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ callback_query_id: update.callback_query.id })
                });
              } catch {
                // Ignore
              }
            }

            if (incomingText && chatId) {
              botInfo.last_chat_id = chatId;
              console.log(`[Telegram] 📩 Received from @${fromName}: "${incomingText}"`);

              // Process via Master Agent
              const result = await onIncomingMessage(incomingText, chatId, fromName);

              let replyText = '';
              let replyButtons: { label: string; action: string }[] | undefined = undefined;

              if (typeof result === 'string') {
                replyText = result;
              } else {
                replyText = result.replyText;
                replyButtons = result.buttons;
              }

              if (!replyButtons || replyButtons.length === 0) {
                replyButtons = [
                  { label: '📊 /status', action: '/status' },
                  { label: '🤖 /agents', action: '/agents' },
                  { label: '🧬 /evolve grant_reviewer', action: '/evolve grant_reviewer' }
                ];
              }

              await sendMessageToTelegram(token, chatId, replyText, replyButtons);
            }
          }
        }
      } catch (pollErr: any) {
        console.warn('[Telegram] Polling warning, retrying in 3s:', pollErr?.message);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  };

  poll();
}

export function stopTelegramPolling() {
  pollingActive = false;
  botInfo.is_connected = false;
  console.log('[Telegram] Polling stopped.');
}
