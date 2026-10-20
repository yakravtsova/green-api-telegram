import { deleteNotification, receiveNotification } from '../api/greenApi';
import type { NotificationBody } from '../api/types';
import { pollNotifications, RETRY_DELAY_MS } from './pollNotifications';

vi.mock('../api/greenApi');

const receiveMock = vi.mocked(receiveNotification);
const deleteMock = vi.mocked(deleteNotification);

const credentials = {
  apiUrl: 'https://api.green-api.com',
  idInstance: '4100000001',
  apiTokenInstance: 'pass123',
};

const body: NotificationBody = { typeWebhook: 'incomingMessageReceived', timestamp: 1763115112 };

let controller: AbortController;

// Последний вызов receiveNotification останавливает цикл, чтобы тест завершился
function stopOnNextReceive() {
  receiveMock.mockImplementationOnce(async () => {
    controller.abort();
    return null;
  });
}

beforeEach(() => {
  controller = new AbortController();
  deleteMock.mockResolvedValue({ result: true });
});

afterEach(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
});

describe('pollNotifications', () => {
  it('passes each notification to the handler and deletes it from the queue', async () => {
    receiveMock.mockResolvedValueOnce({ receiptId: 1, body });
    stopOnNextReceive();
    const onNotification = vi.fn();

    await pollNotifications(credentials, onNotification, controller.signal);

    expect(receiveMock).toHaveBeenCalledWith(credentials, 20, controller.signal);
    expect(onNotification).toHaveBeenCalledWith(body);
    expect(deleteMock).toHaveBeenCalledWith(credentials, 1);
  });

  it('keeps polling when the queue is empty', async () => {
    receiveMock.mockResolvedValueOnce(null);
    stopOnNextReceive();
    const onNotification = vi.fn();

    await pollNotifications(credentials, onNotification, controller.signal);

    expect(receiveMock).toHaveBeenCalledTimes(2);
    expect(onNotification).not.toHaveBeenCalled();
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it('retries after a delay when the request fails', async () => {
    vi.useFakeTimers();
    receiveMock.mockRejectedValueOnce(new Error('Network error'));
    stopOnNextReceive();

    const polling = pollNotifications(credentials, vi.fn(), controller.signal);

    await vi.advanceTimersByTimeAsync(RETRY_DELAY_MS - 1);
    expect(receiveMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await polling;
    expect(receiveMock).toHaveBeenCalledTimes(2);
  });

  it('stops when the pending request is aborted', async () => {
    receiveMock.mockImplementationOnce(
      (_credentials, _timeout, signal) =>
        new Promise((_, reject) => {
          signal?.addEventListener('abort', () => reject(new DOMException('', 'AbortError')));
        }),
    );

    const polling = pollNotifications(credentials, vi.fn(), controller.signal);
    controller.abort();
    await polling;

    expect(receiveMock).toHaveBeenCalledTimes(1);
  });
});
