import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { receiveNotification, sendMessage } from '../../api/greenApi';
import { AuthContext } from '../../auth/AuthContext';
import { findChat } from '../../state/findChat';
import ChatPage from './ChatPage';

vi.mock('../../api/greenApi');
vi.mock('../../state/findChat');

const findChatMock = vi.mocked(findChat);
const sendMessageMock = vi.mocked(sendMessage);
const receiveNotificationMock = vi.mocked(receiveNotification);

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
  // по умолчанию очередь уведомлений «висит» и ничего не возвращает
  receiveNotificationMock.mockReturnValue(new Promise(() => {}));
});

afterEach(() => {
  vi.resetAllMocks();
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

  describe('sending messages', () => {
    async function openChatAndSend(text: string) {
      const { user } = setup();
      await createChat(user, '+7 900 123-45-67');
      await user.type(screen.getByLabelText('Сообщение'), `${text}{Enter}`);
    }

    it('shows the message as sending, then as sent', async () => {
      let finishSending: (response: { idMessage: string }) => void = () => {};
      sendMessageMock.mockReturnValueOnce(new Promise((resolve) => (finishSending = resolve)));

      await openChatAndSend('Привет');

      expect(sendMessageMock).toHaveBeenCalledWith(credentials, 'id-79001234567', 'Привет');
      const messages = screen.getByRole('list', { name: 'Сообщения' });
      expect(within(messages).getByText('Привет')).toBeInTheDocument();
      expect(within(messages).getByRole('img', { name: 'Отправляется' })).toBeInTheDocument();

      finishSending({ idMessage: '1769676078000' });

      expect(await within(messages).findByRole('img', { name: 'Отправлено' })).toBeInTheDocument();
    });

    it('marks the message as not sent when the request fails', async () => {
      sendMessageMock.mockRejectedValueOnce(new Error('Network error'));

      await openChatAndSend('Привет');

      expect(await screen.findByRole('img', { name: 'Не отправлено' })).toBeInTheDocument();
    });

    it('keeps messages separately for each chat', async () => {
      sendMessageMock.mockResolvedValue({ idMessage: '1' });
      const { user } = setup();

      await createChat(user, '+7 900 111-11-11');
      await user.type(screen.getByLabelText('Сообщение'), 'Первому{Enter}');
      await createChat(user, '+7 900 222-22-22');

      expect(screen.getByText('Сообщений пока нет')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '+79001111111 Вы: Первому' }));

      const messages = screen.getByRole('list', { name: 'Сообщения' });
      expect(within(messages).getByText('Первому')).toBeInTheDocument();
    });
  });

  describe('receiving messages', () => {
    function notification(phone: number, text: string) {
      return {
        receiptId: 1,
        body: {
          typeWebhook: 'incomingMessageReceived',
          timestamp: 1763115112,
          idMessage: `msg-${text}`,
          senderData: { chatId: `id-${phone}`, chatType: 'user', senderPhoneNumber: phone },
          messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: text } },
        },
      };
    }

    it('creates a chat for a message from an unknown sender', async () => {
      receiveNotificationMock.mockResolvedValueOnce(notification(79001234567, 'Привет!'));
      const { user } = setup();

      await user.click(await screen.findByRole('button', { name: '+79001234567 Привет!' }));

      const messages = screen.getByRole('list', { name: 'Сообщения' });
      expect(within(messages).getByText('Привет!')).toBeInTheDocument();
    });

    it('adds the reply to the open chat', async () => {
      let deliver: (response: ReturnType<typeof notification>) => void = () => {};
      receiveNotificationMock.mockReturnValueOnce(new Promise((resolve) => (deliver = resolve)));
      const { user } = setup();
      await createChat(user, '+7 900 123-45-67');

      deliver(notification(79001234567, 'Ответ'));

      const messages = await screen.findByRole('list', { name: 'Сообщения' });
      expect(within(messages).getByText('Ответ')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /^\+79001234567/ })).toHaveLength(1);
    });
  });
});
