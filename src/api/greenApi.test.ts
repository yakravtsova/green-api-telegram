import { ApiError, getStateInstance } from './greenApi';

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
    );
  });

  it('throws ApiError with the HTTP status when the request fails', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));

    const error = await getStateInstance(credentials).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401, message: 'Unauthorized' });
  });
});
