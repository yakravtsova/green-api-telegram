import { clearCredentials, loadCredentials, saveCredentials } from './credentialsStorage';

const credentials = {
  apiUrl: 'https://api.green-api.com',
  idInstance: '4100000001',
  apiTokenInstance: 'pass123',
};

afterEach(() => {
  localStorage.clear();
});

describe('credentialsStorage', () => {
  it('returns null when nothing is saved', () => {
    expect(loadCredentials()).toBeNull();
  });

  it('loads saved credentials', () => {
    saveCredentials(credentials);

    expect(loadCredentials()).toEqual(credentials);
  });

  it('clears saved credentials', () => {
    saveCredentials(credentials);
    clearCredentials();

    expect(loadCredentials()).toBeNull();
  });

  it.each(['not json', '{"idInstance":"4100000001"}', '42'])(
    'ignores invalid stored value %j',
    (stored) => {
      localStorage.setItem('green-api-credentials', stored);

      expect(loadCredentials()).toBeNull();
    },
  );
});
