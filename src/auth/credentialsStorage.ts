import type { Credentials } from '../api/types';

const STORAGE_KEY = 'green-api-credentials';

function isCredentials(value: unknown): value is Credentials {
  if (typeof value !== 'object' || value === null) return false;
  const { apiUrl, idInstance, apiTokenInstance } = value as Record<string, unknown>;
  return (
    typeof apiUrl === 'string' &&
    typeof idInstance === 'string' &&
    typeof apiTokenInstance === 'string'
  );
}

export function loadCredentials(): Credentials | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    return isCredentials(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCredentials(credentials: Credentials) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  } catch {
    // Без localStorage приложение работает, но после перезагрузки придётся войти снова
  }
}

export function clearCredentials() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Нечего очищать
  }
}
