import { chatReducer, initialChatState } from './chatReducer';

const first = { chatId: '10000001', phone: '79001111111' };
const second = { chatId: '10000002', phone: '79002222222', username: '@second' };

describe('chatReducer', () => {
  it('adds a new chat to the top of the list and selects it', () => {
    const withFirst = chatReducer(initialChatState, { type: 'chatCreated', chat: first });
    const withSecond = chatReducer(withFirst, { type: 'chatCreated', chat: second });

    expect(withSecond).toEqual({
      chats: [second, first],
      activeChatId: '10000002',
    });
  });

  it('does not duplicate an existing chat, only selects it', () => {
    const state = { chats: [second, first], activeChatId: '10000002' };

    const next = chatReducer(state, { type: 'chatCreated', chat: first });

    expect(next.chats).toBe(state.chats);
    expect(next.activeChatId).toBe('10000001');
  });

  it('selects a chat', () => {
    const state = { chats: [first], activeChatId: null };

    expect(chatReducer(state, { type: 'chatSelected', chatId: '10000001' }).activeChatId).toBe(
      '10000001',
    );
  });
});
