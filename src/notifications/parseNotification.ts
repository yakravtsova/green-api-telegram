import type { MessageData, NotificationBody } from '../api/types';
import type { Contact, Message } from '../state/chatReducer';

export interface ReceivedMessage {
  contact: Contact;
  message: Message;
}

function getText(messageData?: MessageData): string | null {
  switch (messageData?.typeMessage) {
    case 'textMessage':
      return messageData.textMessageData?.textMessage ?? null;
    case 'extendedTextMessage':
      return messageData.extendedTextMessageData?.text ?? null;
    default:
      return null;
  }
}

/** Достаёт входящее текстовое сообщение из личного чата, остальные уведомления — null */
export function parseNotification(body: NotificationBody): ReceivedMessage | null {
  const { typeWebhook, idMessage, timestamp, senderData, messageData } = body;

  if (typeWebhook !== 'incomingMessageReceived' || !idMessage || !senderData) return null;
  if (senderData.chatType && senderData.chatType !== 'user') return null;

  const text = getText(messageData);
  if (text === null) return null;

  const { chatId, senderName, senderPhoneNumber } = senderData;

  return {
    contact: {
      chatId,
      phone: senderPhoneNumber ? String(senderPhoneNumber) : '',
      name: senderName || undefined,
    },
    message: {
      id: idMessage,
      idMessage,
      direction: 'incoming',
      text,
      timestamp: timestamp * 1000,
    },
  };
}
