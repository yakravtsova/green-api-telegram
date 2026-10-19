import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContext } from '../../auth/AuthContext';
import { findChat } from '../../state/findChat';
import ChatPage from './ChatPage';

vi.mock('../../state/findChat');

const findChatMock = vi.mocked(findChat);

const credentials = {
  apiUrl: 'https://api.green-api.com',
  idInstance: '4100000001',
  apiTokenInstance: 'pass123',
};

function setup() {
  const user = userEvent.setup();
  render(
    <AuthContext.Provider value={{ credentials, login: vi.fn(), logout: vi.fn() }}>
      <ChatPage />
    </AuthContext.Provider>,
  );
  return { user };
}

async function createChat(user: ReturnType<typeof userEvent.setup>, phone: string) {
  await user.type(screen.getByLabelText('Номер телефона'), `${phone}{Enter}`);
}

beforeEach(() => {
  // chatId в Telegram — число, не связанное с номером; здесь просто делаем его уникальным
  findChatMock.mockImplementation(async (_, phone) => ({ chatId: `id-${phone}`, phone }));
});

afterEach(() => {
  findChatMock.mockReset();
});

describe('ChatPage', () => {
  it('shows a placeholder until a chat is created', () => {
    setup();

    expect(screen.getByText('Чатов пока нет')).toBeInTheDocument();
    expect(screen.getByText('Выберите чат или создайте новый')).toBeInTheDocument();
  });

  it('finds the account by phone, adds the chat to the list and opens it', async () => {
    findChatMock.mockResolvedValueOnce({
      chatId: '10000000',
      phone: '79001234567',
      username: '@vasilisa',
    });
    const { user } = setup();

    await createChat(user, '8 900 123-45-67');

    expect(findChatMock).toHaveBeenCalledWith(credentials, '79001234567');
    const chatButton = await screen.findByRole('button', { name: '+79001234567 @vasilisa' });
    expect(chatButton).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('heading', { name: '+79001234567' })).toBeInTheDocument();
    expect(screen.queryByText('Выберите чат или создайте новый')).not.toBeInTheDocument();
  });

  it('shows an error when the account is not found', async () => {
    findChatMock.mockRejectedValueOnce(new Error('Аккаунт Telegram не найден'));
    const { user } = setup();

    await createChat(user, '+7 900 123-45-67');

    expect(await screen.findByRole('alert')).toHaveTextContent('Аккаунт Telegram не найден');
    expect(screen.getByText('Чатов пока нет')).toBeInTheDocument();
  });

  it('switches between chats and does not duplicate them', async () => {
    const { user } = setup();

    await createChat(user, '+7 900 111-11-11');
    await createChat(user, '+7 900 222-22-22');
    await createChat(user, '+7 900 111-11-11');

    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('button')).toHaveLength(2);

    await user.click(within(list).getByRole('button', { name: '+79002222222' }));

    expect(within(list).getByRole('button', { name: '+79002222222' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(within(list).getByRole('button', { name: '+79001111111' })).toHaveAttribute(
      'aria-current',
      'false',
    );
    expect(screen.getByRole('heading', { name: '+79002222222' })).toBeInTheDocument();
  });
});
