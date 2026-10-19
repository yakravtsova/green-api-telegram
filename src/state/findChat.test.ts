import { ApiError, checkAccount } from '../api/greenApi';
import { findChat } from './findChat';

vi.mock('../api/greenApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/greenApi')>()),
  checkAccount: vi.fn(),
}));

const checkAccountMock = vi.mocked(checkAccount);

const credentials = {
  apiUrl: 'https://api.green-api.com',
  idInstance: '4100000001',
  apiTokenInstance: 'pass123',
};

afterEach(() => {
  checkAccountMock.mockReset();
});

describe('findChat', () => {
  it('returns a chat with the chatId from checkAccount', async () => {
    checkAccountMock.mockResolvedValueOnce({
      exist: true,
      chatId: '10000000',
      username: '@vasilisa',
    });

    await expect(findChat(credentials, '79001234567')).resolves.toEqual({
      chatId: '10000000',
      phone: '79001234567',
      username: '@vasilisa',
    });
    expect(checkAccountMock).toHaveBeenCalledWith(credentials, 79001234567);
  });

  it('rejects when there is no Telegram account', async () => {
    checkAccountMock.mockResolvedValueOnce({ exist: false, chatId: '' });

    await expect(findChat(credentials, '79001234567')).rejects.toThrow(
      'Аккаунт Telegram с номером +79001234567 не найден или скрыт настройками приватности',
    );
  });

  it('reports the Telegram rate limit returned with HTTP 200', async () => {
    checkAccountMock.mockResolvedValueOnce({
      status: false,
      data: { reason: 'rate_limit_exceeded' },
    });

    await expect(findChat(credentials, '79001234567')).rejects.toThrow(/временно ограничил/);
  });

  it('reports the Telegram rate limit returned with HTTP 469', async () => {
    checkAccountMock.mockRejectedValueOnce(new ApiError(469, 'Rate limited by messenger'));

    await expect(findChat(credentials, '79001234567')).rejects.toThrow(/временно ограничил/);
  });

  it('reports other HTTP errors with the status code', async () => {
    checkAccountMock.mockRejectedValueOnce(new ApiError(500, ''));

    await expect(findChat(credentials, '79001234567')).rejects.toThrow('(ошибка 500)');
  });

  it('reports a connection problem when fetch fails', async () => {
    checkAccountMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(findChat(credentials, '79001234567')).rejects.toThrow(/Не удалось подключиться/);
  });
});
