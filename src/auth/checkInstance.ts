import { ApiError, getStateInstance } from '../api/greenApi';
import type { Credentials, StateInstance } from '../api/types';

const stateMessages: Record<Exclude<StateInstance, 'authorized'>, string> = {
  notAuthorized: 'Инстанс не авторизован. Привяжите аккаунт Telegram в личном кабинете GREEN-API',
  pendingPassword:
    'Инстанс ждёт пароль двухфакторной аутентификации. Завершите вход в личном кабинете',
  starting: 'Инстанс запускается. Попробуйте ещё раз через пару минут',
  blocked: 'Инстанс заблокирован',
  suspended: 'Работа инстанса временно ограничена',
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403)
      return 'Неверный apiUrl, idInstance или apiTokenInstance';

    return `Сервер GREEN-API ответил ошибкой ${error.status}`;
  }
  return 'Не удалось подключиться к серверу. Проверьте apiUrl и интернет';
}

export async function checkInstance(credentials: Credentials) {
  let stateInstance: StateInstance;
  try {
    ({ stateInstance } = await getStateInstance(credentials));
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }

  if (stateInstance !== 'authorized') {
    throw new Error(
      stateMessages[stateInstance] ?? `Неизвестный статус инстанса: ${stateInstance}`,
    );
  }
}
