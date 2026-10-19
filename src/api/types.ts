export interface Credentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export type StateInstance =
  'notAuthorized' | 'authorized' | 'blocked' | 'suspended' | 'starting' | 'pendingPassword';

export interface GetStateInstanceResponse {
  stateInstance: StateInstance;
}

// При ограничениях Telegram метод отвечает HTTP 200, но без exist: { status: false, reason }
export type CheckAccountResponse =
  | { exist: boolean; chatId: string; username?: string; phoneNumber?: number }
  | { status: false; reason?: string; data?: { reason?: string } };
