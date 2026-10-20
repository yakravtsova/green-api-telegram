import { deleteNotification, receiveNotification } from '../api/greenApi';
import type { Credentials, NotificationBody } from '../api/types';

/** Сколько секунд сервер держит запрос, если очередь пуста (допустимо 5–60) */
const RECEIVE_TIMEOUT = 20;
export const RETRY_DELAY_MS = 5000;

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) return resolve();
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

/** Забирает уведомления из очереди по одному, пока signal не отменён */
export async function pollNotifications(
  credentials: Credentials,
  onNotification: (body: NotificationBody) => void,
  signal: AbortSignal,
) {
  while (!signal.aborted) {
    try {
      const notification = await receiveNotification(credentials, RECEIVE_TIMEOUT, signal);
      if (!notification) continue;

      onNotification(notification.body);
      // удаляем любое уведомление, даже ненужное, иначе очередь не сдвинется
      await deleteNotification(credentials, notification.receiptId);
    } catch {
      await wait(RETRY_DELAY_MS, signal);
    }
  }
}
