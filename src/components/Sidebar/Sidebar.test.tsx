import { render, screen } from '@testing-library/react';
import { AuthContext } from '../../auth/AuthContext';
import type { Chat, Message } from '../../state/chatReducer';
import Sidebar from './Sidebar';

const credentials = {
  apiUrl: 'https://api.green-api.com',
  idInstance: '4100000001',
  apiTokenInstance: 'pass123',
};

function message(direction: Message['direction'], text: string): Message {
  return { id: text, direction, text, timestamp: 1 };
}

function renderSidebar(chats: Chat[]) {
  render(
    <AuthContext.Provider value={{ credentials, login: vi.fn(), logout: vi.fn() }}>
      <Sidebar chats={chats} activeChatId={null} onCreateChat={vi.fn()} onSelectChat={vi.fn()} />
    </AuthContext.Provider>,
  );
}

describe('Sidebar', () => {
  it('shows the last message of each chat', () => {
    renderSidebar([
      {
        chatId: '1',
        phone: '79001111111',
        messages: [message('outgoing', 'Привет'), message('incoming', 'Ответ')],
      },
      { chatId: '2', phone: '79002222222', messages: [message('outgoing', 'Как дела?')] },
    ]);

    expect(screen.getByRole('button', { name: '+79001111111 Ответ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+79002222222 Вы: Как дела?' })).toBeInTheDocument();
  });

  it('shows the username next to the title along with the last message', () => {
    renderSidebar([
      {
        chatId: '1',
        phone: '79001111111',
        username: '@vasilisa',
        messages: [message('incoming', 'Ответ')],
      },
    ]);

    expect(
      screen.getByRole('button', { name: '+79001111111 @vasilisa Ответ' }),
    ).toBeInTheDocument();
  });
});
