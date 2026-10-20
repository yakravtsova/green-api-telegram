import { validateCredentials } from './validateCredentials';

const valid = {
  apiUrl: 'https://api.green-api.com',
  idInstance: '4100000001',
  apiTokenInstance: 'pass123',
};

describe('validateCredentials', () => {
  it('returns no errors for valid credentials', () => {
    expect(validateCredentials(valid)).toEqual({});
  });

  it('requires every field', () => {
    expect(validateCredentials({ apiUrl: '', idInstance: '', apiTokenInstance: '' })).toEqual({
      apiUrl: 'Укажите apiUrl',
      idInstance: 'Укажите idInstance',
      apiTokenInstance: 'Укажите apiTokenInstance',
    });
  });

  it.each(['api.green-api.com', 'ftp://api.green-api.com', 'not a url'])(
    'rejects apiUrl %j',
    (apiUrl) => {
      expect(validateCredentials({ ...valid, apiUrl })).toHaveProperty('apiUrl');
    },
  );

  it.each(['41000a', '4100 0001', '-1'])('rejects idInstance %j', (idInstance) => {
    expect(validateCredentials({ ...valid, idInstance })).toHaveProperty('idInstance');
  });
});
