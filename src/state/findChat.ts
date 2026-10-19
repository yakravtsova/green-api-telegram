import { ApiError, checkAccount } from '../api/greenApi';
import type { CheckAccountResponse, Credentials } from '../api/types';
import { formatPhone } from '../lib/phone';
import type { Chat } from './chatReducer';

const RATE_LIMIT_MESSAGE = 'Telegram временно ограничил проверку номеров. Попробуйте позже';

async function requestAccount(credentials: Credentials, phone: string) {
  try {
    return await checkAccount(credentials, Number(phone));
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(
        error.status === 469
          ? RATE_LIMIT_MESSAGE
          : `Не удалось проверить номер (ошибка ${error.status})`,
      );
    }
    throw new Error('Не удалось подключиться к серверу GREEN-API');
  }
}

function isAccountResult(
  response: CheckAccountResponse,
): response is Extract<CheckAccountResponse, { exist: boolean }> {
  return 'exist' in response;
}

/** Ищет аккаунт Telegram по номеру (только цифры) и возвращает чат с его настоящим chatId */
export async function findChat(credentials: Credentials, phone: string): Promise<Chat> {
  const response = await requestAccount(credentials, phone);

  if (!isAccountResult(response)) {
    throw new Error(
      response.data?.reason === 'rate_limit_exceeded'
        ? RATE_LIMIT_MESSAGE
        : `Не удалось проверить номер: ${response.reason ?? 'неизвестная ошибка'}`,
    );
  }

  if (!response.exist || !response.chatId) {
    throw new Error(
      `Аккаунт Telegram с номером ${formatPhone(phone)} не найден или скрыт настройками приватности`,
    );
  }

  return { chatId: response.chatId, phone, username: response.username || undefined };
}
