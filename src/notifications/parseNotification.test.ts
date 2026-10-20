import type { NotificationBody } from '../api/types';
import { parseNotification } from './parseNotification';

// Пример из документации GREEN-API для Telegram
const textMessage: NotificationBody = {
  typeWebhook: 'incomingMessageReceived',
  timestamp: 1763115112,
  idMessage: '1763115112345',
  senderData: {
    chatId: '10000000',
    chatType: 'user',
    senderName: 'Василиса Премудрая',
    senderPhoneNumber: 79998887766,
  },
  messageData: {
    typeMessage: 'textMessage',
    textMessageData: { textMessage: 'Привет от GREEN-API!' },
  },
};

describe('parseNotification', () => {
  it('parses an incoming text message', () => {
    expect(parseNotification(textMessage)).toEqual({
      contact: { chatId: '10000000', phone: '79998887766', name: 'Василиса Премудрая' },
      message: {
        id: '1763115112345',
        idMessage: '1763115112345',
        direction: 'incoming',
        text: 'Привет от GREEN-API!',
        timestamp: 1763115112000,
      },
    });
  });

  it('parses a message with a link preview', () => {
    const result = parseNotification({
      ...textMessage,
      messageData: {
        typeMessage: 'extendedTextMessage',
        extendedTextMessageData: { text: 'Документация: https://green-api.com/' },
      },
    });

    expect(result?.message.text).toBe('Документация: https://green-api.com/');
  });

  it('leaves the phone empty when the sender hides it', () => {
    const result = parseNotification({
      ...textMessage,
      senderData: { ...textMessage.senderData!, senderPhoneNumber: 0 },
    });

    expect(result?.contact.phone).toBe('');
  });

  it.each<[string, Partial<NotificationBody>]>([
    ['other notification types', { typeWebhook: 'outgoingMessageStatus' }],
    ['non-text messages', { messageData: { typeMessage: 'imageMessage' } }],
    [
      'group chats',
      { senderData: { chatId: '-10000000000000', chatType: 'supergroup', senderPhoneNumber: 0 } },
    ],
  ])('ignores %s', (_, override) => {
    expect(parseNotification({ ...textMessage, ...override })).toBeNull();
  });
});
