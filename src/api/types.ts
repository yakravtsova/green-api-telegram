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

export interface SendMessageResponse {
  idMessage: string;
}

export interface SenderData {
  chatId: string;
  /** user — личный чат; у групп и каналов другой тип и отрицательный chatId */
  chatType?: string;
  chatName?: string;
  senderName?: string;
  /** 0, если номер скрыт настройками приватности */
  senderPhoneNumber?: number;
}

export interface MessageData {
  typeMessage: string;
  textMessageData?: { textMessage: string };
  extendedTextMessageData?: { text: string };
}

export interface NotificationBody {
  typeWebhook: string;
  timestamp: number;
  idMessage?: string;
  senderData?: SenderData;
  messageData?: MessageData;
}

export interface ReceiveNotificationResponse {
  receiptId: number;
  body: NotificationBody;
}

export interface DeleteNotificationResponse {
  result: boolean;
}
