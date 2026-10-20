import { chatReducer, initialChatState, type ChatState, type Message } from './chatReducer';

const first = { chatId: '10000001', phone: '79001111111' };
const second = { chatId: '10000002', phone: '79002222222', username: '@second' };

const sending: Message = {
  id: 'local-1',
  direction: 'outgoing',
  text: 'Привет',
  timestamp: 1,
  status: 'sending',
};

describe('chatReducer', () => {
  it('adds a new chat with no messages to the top of the list and selects it', () => {
    const withFirst = chatReducer(initialChatState, { type: 'chatCreated', contact: first });
    const withSecond = chatReducer(withFirst, { type: 'chatCreated', contact: second });

    expect(withSecond).toEqual({
      chats: [
        { ...second, messages: [] },
        { ...first, messages: [] },
      ],
      activeChatId: '10000002',
    });
  });

  it('does not duplicate an existing chat, only selects it', () => {
    const state: ChatState = {
      chats: [
        { ...second, messages: [] },
        { ...first, messages: [sending] },
      ],
      activeChatId: '10000002',
    };

    const next = chatReducer(state, { type: 'chatCreated', contact: first });

    expect(next.chats).toBe(state.chats);
    expect(next.activeChatId).toBe('10000001');
  });

  it('selects a chat', () => {
    const state: ChatState = { chats: [{ ...first, messages: [] }], activeChatId: null };

    expect(chatReducer(state, { type: 'chatSelected', chatId: '10000001' }).activeChatId).toBe(
      '10000001',
    );
  });

  describe('messages', () => {
    const state: ChatState = {
      chats: [
        { ...first, messages: [] },
        { ...second, messages: [] },
      ],
      activeChatId: '10000001',
    };

    it('appends a sending message to its chat only', () => {
      const next = chatReducer(state, {
        type: 'messageSending',
        chatId: '10000001',
        message: sending,
      });

      expect(next.chats[0].messages).toEqual([sending]);
      expect(next.chats[1]).toBe(state.chats[1]);
    });

    it('marks a message as sent and stores idMessage', () => {
      const withMessage = chatReducer(state, {
        type: 'messageSending',
        chatId: '10000001',
        message: sending,
      });

      const next = chatReducer(withMessage, {
        type: 'messageSent',
        chatId: '10000001',
        id: 'local-1',
        idMessage: '1769676078000',
      });

      expect(next.chats[0].messages[0]).toEqual({
        ...sending,
        idMessage: '1769676078000',
        status: 'sent',
      });
    });

    it('marks a message as failed', () => {
      const withMessage = chatReducer(state, {
        type: 'messageSending',
        chatId: '10000001',
        message: sending,
      });

      const next = chatReducer(withMessage, {
        type: 'messageFailed',
        chatId: '10000001',
        id: 'local-1',
      });

      expect(next.chats[0].messages[0].status).toBe('error');
    });
  });
});
