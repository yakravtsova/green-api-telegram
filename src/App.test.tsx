import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import AuthProvider from './auth/AuthProvider';
import { checkInstance } from './auth/checkInstance';
import { loadCredentials, saveCredentials } from './auth/credentialsStorage';

vi.mock('./auth/checkInstance');
vi.mock('./notifications/useNotificationsPolling');

const checkInstanceMock = vi.mocked(checkInstance);

const credentials = {
  apiUrl: 'https://api.green-api.com',
  idInstance: '4100000001',
  apiTokenInstance: 'pass123',
};

function renderApp() {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>,
  );
}

afterEach(() => {
  localStorage.clear();
  checkInstanceMock.mockReset();
});

describe('App', () => {
  it('shows the login form when there is no saved session', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument();
  });

  it('opens the chat page after successful login and saves the session', async () => {
    checkInstanceMock.mockResolvedValueOnce();
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText('idInstance'), credentials.idInstance);
    await user.type(screen.getByLabelText('apiTokenInstance'), credentials.apiTokenInstance);
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByText('Инстанс 4100000001')).toBeInTheDocument();
    expect(loadCredentials()).toEqual(credentials);
  });

  it('stays on the login form when the instance check fails', async () => {
    checkInstanceMock.mockRejectedValueOnce(new Error('Инстанс не авторизован'));
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText('idInstance'), credentials.idInstance);
    await user.type(screen.getByLabelText('apiTokenInstance'), credentials.apiTokenInstance);
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Инстанс не авторизован');
    expect(loadCredentials()).toBeNull();
  });

  it('restores the saved session without logging in again', () => {
    saveCredentials(credentials);
    renderApp();

    expect(screen.getByText('Инстанс 4100000001')).toBeInTheDocument();
    expect(checkInstanceMock).not.toHaveBeenCalled();
  });

  it('logs out and forgets the session', async () => {
    saveCredentials(credentials);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Выйти' }));

    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument();
    expect(loadCredentials()).toBeNull();
  });
});
