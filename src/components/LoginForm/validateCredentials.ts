import type { Credentials } from '../../api/types';

export type CredentialsErrors = Partial<Record<keyof Credentials, string>>;

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateCredentials({
  apiUrl,
  idInstance,
  apiTokenInstance,
}: Credentials): CredentialsErrors {
  const errors: CredentialsErrors = {};

  if (!apiUrl) {
    errors.apiUrl = 'Укажите apiUrl';
  } else if (!isHttpUrl(apiUrl)) {
    errors.apiUrl = 'Введите адрес вида https://api.green-api.com';
  }

  if (!idInstance) {
    errors.idInstance = 'Укажите idInstance';
  } else if (!/^\d+$/.test(idInstance)) {
    errors.idInstance = 'idInstance состоит только из цифр';
  }

  if (!apiTokenInstance) {
    errors.apiTokenInstance = 'Укажите apiTokenInstance';
  }

  return errors;
}
