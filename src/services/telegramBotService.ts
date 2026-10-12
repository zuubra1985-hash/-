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

// Split text into chunks < 4000 chars for Telegram
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

export async function sendTypingAction(token: string, chatId: number | string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, action: 'typing' })
    });
  } catch {
    // Ignore
  }
}

export async function sendMessageToTelegram(
  token: string,
  chatId: number | string,
  text: string
): Promise<boolean> {
  try {
    const chunks = splitTextChunks(text, 3900);

    for (const chunk of chunks) {
      const payload = {
        chat_id: chatId,
        text: chunk
      };

      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data: any = await response.json();
      if (data.ok) {
        botInfo.messages_sent_count += 1;
      } else {
        console.warn('[Telegram] sendMessage failed:', data);
        return false;
      }
    }
    return true;
  } catch (err: any) {
    console.error('[Telegram] Failed to send message:', err);
    botInfo.error = err?.message || 'Network send error';
    return false;
  }
}

async function registerBotCommands(token: string) {
  try {
    const commands = [
      { command: 'start', description: 'Начать общение с Miu' },
      { command: 'memory', description: 'Посмотреть что агент помнит о вас' },
      { command: 'reset', description: 'Очистить историю текущего диалога' },
      { command: 'help', description: 'Возможности персонального агента' }
    ];

    await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands })
    });
    console.log('[Telegram] Commands registered.');
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
  ) => Promise<string>;
}) {
  if (pollingActive) {
    return;
  }
  pollingActive = true;

  const { token, onIncomingMessage } = params;

  // 1. Initial check
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
        console.log(`[Telegram] ✅ Connected to @${data.result.username} (${data.result.first_name})`);
        registerBotCommands(token);
      } else {
        botInfo.is_connected = false;
        botInfo.error = data.description || 'Invalid token';
      }
    })
    .catch((err) => {
      botInfo.is_connected = false;
      botInfo.error = err.message;
    });

  // 2. Long polling loop
  const poll = async () => {
    while (pollingActive) {
      try {
        botInfo.last_poll_time = new Date().toLocaleTimeString('ru-RU');
        const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=20`;
        const res = await fetch(url);
        const data: any = await res.json();

        if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
          for (const update of data.result) {
            lastUpdateId = Math.max(lastUpdateId, update.update_id);
            botInfo.updates_received_count += 1;

            let incomingText = '';
            let chatId: number | string = '';
            let fromName = 'Пользователь';

            if (update.message) {
              incomingText = update.message.text || update.message.caption || '';
              chatId = update.message.chat.id;
              fromName =
                update.message.from?.first_name ||
                update.message.from?.username ||
                'Пользователь';
            }

            if (incomingText && chatId) {
              botInfo.last_chat_id = chatId;
              console.log(`[Telegram] 📩 From ${fromName}: "${incomingText}"`);

              // Show typing indicator in Telegram
              sendTypingAction(token, chatId);

              // Process via agent and Gemini
              const replyText = await onIncomingMessage(incomingText, chatId, fromName);

              // Send back to Telegram
              await sendMessageToTelegram(token, chatId, replyText);
            }
          }
        }
      } catch (err: any) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  };

  poll();
}

export function stopTelegramPolling() {
  pollingActive = false;
  botInfo.is_connected = false;
}
