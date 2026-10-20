import type {
  CheckAccountResponse,
  Credentials,
  DeleteNotificationResponse,
  GetStateInstanceResponse,
  ReceiveNotificationResponse,
  SendMessageResponse,
} from './types';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  /** Дописывается после токена: /receiptId или ?receiveTimeout=… */
  suffix?: string;
  signal?: AbortSignal;
}

async function request<T>(
  credentials: Credentials,
  apiMethod: string,
  { body, method = body === undefined ? 'GET' : 'POST', suffix = '', signal }: RequestOptions = {},
): Promise<T> {
  const { apiUrl, idInstance, apiTokenInstance } = credentials;
  // чистим apiUrl от возможного слеша в конце
  const base = apiUrl.replace(/\/+$/, '');

  const response = await fetch(
    `${base}/waInstance${idInstance}/${apiMethod}/${apiTokenInstance}${suffix}`,
    body === undefined
      ? { method, signal }
      : {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal,
        },
  );

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  // receiveNotification при пустой очереди отвечает пустым телом
  const text = await response.text();
  return JSON.parse(text || 'null');
}

export function getStateInstance(credentials: Credentials) {
  return request<GetStateInstanceResponse>(credentials, 'getStateInstance');
}

export function checkAccount(credentials: Credentials, phoneNumber: number) {
  return request<CheckAccountResponse>(credentials, 'checkAccount', { body: { phoneNumber } });
}

export function sendMessage(credentials: Credentials, chatId: string, message: string) {
  return request<SendMessageResponse>(credentials, 'sendMessage', {
    body: { chatId, message },
  });
}

export function receiveNotification(
  credentials: Credentials,
  receiveTimeout: number,
  signal?: AbortSignal,
) {
  return request<ReceiveNotificationResponse | null>(credentials, 'receiveNotification', {
    suffix: `?receiveTimeout=${receiveTimeout}`,
    signal,
  });
}

export function deleteNotification(credentials: Credentials, receiptId: number) {
  return request<DeleteNotificationResponse>(credentials, 'deleteNotification', {
    method: 'DELETE',
    suffix: `/${receiptId}`,
  });
}
