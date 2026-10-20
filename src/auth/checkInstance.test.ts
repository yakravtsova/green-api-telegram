import { ApiError, getStateInstance } from '../api/greenApi';
import { checkInstance } from './checkInstance';

vi.mock('../api/greenApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/greenApi')>()),
  getStateInstance: vi.fn(),
}));

const getStateInstanceMock = vi.mocked(getStateInstance);

const credentials = {
  apiUrl: 'https://api.green-api.com',
  idInstance: '4100000001',
  apiTokenInstance: 'pass123',
};

afterEach(() => {
  getStateInstanceMock.mockReset();
});

describe('checkInstance', () => {
  it('resolves when the instance is authorized', async () => {
    getStateInstanceMock.mockResolvedValueOnce({ stateInstance: 'authorized' });

    await expect(checkInstance(credentials)).resolves.toBeUndefined();
    expect(getStateInstanceMock).toHaveBeenCalledWith(credentials);
  });

  it.each([
    ['notAuthorized', /не авторизован/],
    ['pendingPassword', /пароль/],
    ['starting', /запускается/],
    ['blocked', /заблокирован/],
    ['suspended', /ограничена/],
  ] as const)('rejects with a readable message for state %s', async (stateInstance, message) => {
    getStateInstanceMock.mockResolvedValueOnce({ stateInstance });

    await expect(checkInstance(credentials)).rejects.toThrow(message);
  });

  it.each([
    [401, 'Неверный apiUrl, idInstance или apiTokenInstance'],
    [403, 'Неверный apiUrl, idInstance или apiTokenInstance'],
    [500, 'Сервер GREEN-API ответил ошибкой 500'],
  ])('maps HTTP %i to a readable message', async (status, message) => {
    getStateInstanceMock.mockRejectedValueOnce(new ApiError(status, ''));

    await expect(checkInstance(credentials)).rejects.toThrow(message);
  });

  it('reports a connection problem when fetch fails', async () => {
    getStateInstanceMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(checkInstance(credentials)).rejects.toThrow(/Не удалось подключиться/);
  });
});
