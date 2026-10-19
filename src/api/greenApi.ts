import type { CheckAccountResponse, Credentials, GetStateInstanceResponse } from './types';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(credentials: Credentials, apiMethod: string, body?: unknown): Promise<T> {
  const { apiUrl, idInstance, apiTokenInstance } = credentials;
  // чистим apiUrl от возможного слеша в конце
  const base = apiUrl.replace(/\/+$/, '');

  const response = await fetch(
    `${base}/waInstance${idInstance}/${apiMethod}/${apiTokenInstance}`,
    body === undefined
      ? { method: 'GET' }
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
  );

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  return response.json();
}

export function getStateInstance(credentials: Credentials) {
  return request<GetStateInstanceResponse>(credentials, 'getStateInstance');
}

export function checkAccount(credentials: Credentials, phoneNumber: number) {
  return request<CheckAccountResponse>(credentials, 'checkAccount', { phoneNumber });
}
