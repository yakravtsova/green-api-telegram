import { ApiError, checkAccount, getStateInstance, sendMessage } from './greenApi';

const credentials = {
  apiUrl: 'https://api.green-api.com/',
  idInstance: '4100000001',
  apiTokenInstance: 'pass123',
};

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe('getStateInstance', () => {
  it('requests the instance state and returns the response', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ stateInstance: 'authorized' }));

    await expect(getStateInstance(credentials)).resolves.toEqual({ stateInstance: 'authorized' });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance4100000001/getStateInstance/pass123',
      { method: 'GET' },
    );
  });

  it('throws ApiError with the HTTP status when the request fails', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));

    const error = await getStateInstance(credentials).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401, message: 'Unauthorized' });
  });
});

describe('checkAccount', () => {
  it('posts the phone number as JSON', async () => {
    const account = { exist: true, chatId: '10000000', username: '@vasilisa' };
    fetchMock.mockResolvedValueOnce(Response.json(account));

    await expect(checkAccount(credentials, 79001234567)).resolves.toEqual(account);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance4100000001/checkAccount/pass123',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"phoneNumber":79001234567}',
      },
    );
  });
});

describe('sendMessage', () => {
  it('posts chatId and message text and returns idMessage', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ idMessage: '1769676078000' }));

    await expect(sendMessage(credentials, '10000000', 'Привет')).resolves.toEqual({
      idMessage: '1769676078000',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance4100000001/sendMessage/pass123',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"chatId":"10000000","message":"Привет"}',
      },
    );
  });
});
