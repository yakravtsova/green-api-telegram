import { useEffect } from 'react';
import type { Credentials, NotificationBody } from '../api/types';
import { pollNotifications } from './pollNotifications';

/** onNotification должен быть стабильным (useCallback), иначе опрос будет перезапускаться */
export function useNotificationsPolling(
  credentials: Credentials | null,
  onNotification: (body: NotificationBody) => void,
) {
  useEffect(() => {
    if (!credentials) return;

    const controller = new AbortController();
    void pollNotifications(credentials, onNotification, controller.signal);

    return () => controller.abort();
  }, [credentials, onNotification]);
}
