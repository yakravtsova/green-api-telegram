import type { MessageData, NotificationBody, SenderData } from '../api/types';
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

function getContact(typeWebhook: string, senderData: SenderData): Contact {
  const { chatId, chatName, senderName, senderPhoneNumber } = senderData;

  // в исходящем отправитель — мы сами, поэтому номер собеседника неизвестен
  if (typeWebhook === 'outgoingMessageReceived') {
    return { chatId, phone: '', name: chatName || undefined };
  }
  return {
    chatId,
    phone: senderPhoneNumber ? String(senderPhoneNumber) : '',
    name: senderName || undefined,
  };
}

/**
 * Достаёт текстовое сообщение из личного чата: входящее или отправленное с телефона.
 * Остальные уведомления — null. outgoingAPIMessageReceived (отправленные через API, то есть
 * из этого приложения) тоже пропускаем: такие сообщения уже есть в чате.
 */
export function parseNotification(body: NotificationBody): ReceivedMessage | null {
  const { typeWebhook, idMessage, timestamp, senderData, messageData } = body;

  if (typeWebhook !== 'incomingMessageReceived' && typeWebhook !== 'outgoingMessageReceived') {
    return null;
  }
  if (!idMessage || !senderData) return null;
  if (senderData.chatType && senderData.chatType !== 'user') return null;

  const text = getText(messageData);
  if (text === null) return null;

  const isOutgoing = typeWebhook === 'outgoingMessageReceived';

  return {
    contact: getContact(typeWebhook, senderData),
    message: {
      id: idMessage,
      idMessage,
      direction: isOutgoing ? 'outgoing' : 'incoming',
      text,
      timestamp: timestamp * 1000,
      ...(isOutgoing && { status: 'sent' }),
    },
  };
}
