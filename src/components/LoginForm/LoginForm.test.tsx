import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Credentials } from '../../api/types';
import LoginForm from './LoginForm';

function setup() {
  const onSubmit = vi.fn<(credentials: Credentials) => Promise<void>>();
  const user = userEvent.setup();
  render(<LoginForm onSubmit={onSubmit} />);
  return { onSubmit, user };
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('idInstance'), '4100000001');
  await user.type(screen.getByLabelText('apiTokenInstance'), 'pass123');
}

describe('LoginForm', () => {
  it('shows errors and does not submit when required fields are empty', async () => {
    const { onSubmit, user } = setup();

    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(screen.getByText('Укажите idInstance')).toBeInTheDocument();
    expect(screen.getByText('Укажите apiTokenInstance')).toBeInTheDocument();
    expect(screen.getByLabelText('idInstance')).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('hides the error of a field once the user edits it', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('button', { name: 'Войти' }));
    await user.type(screen.getByLabelText('idInstance'), '4');

    expect(screen.queryByText('Укажите idInstance')).not.toBeInTheDocument();
    expect(screen.getByText('Укажите apiTokenInstance')).toBeInTheDocument();
  });

  it('submits trimmed values when the form is valid', async () => {
    const { onSubmit, user } = setup();

    await user.type(screen.getByLabelText('idInstance'), ' 4100000001 ');
    await user.type(screen.getByLabelText('apiTokenInstance'), 'pass123');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(onSubmit).toHaveBeenCalledWith({
      apiUrl: 'https://api.green-api.com',
      idInstance: '4100000001',
      apiTokenInstance: 'pass123',
    });
  });

  it('disables the button while the instance is being checked', async () => {
    const { onSubmit, user } = setup();
    let finishLogin = () => {};
    onSubmit.mockReturnValueOnce(new Promise((resolve) => (finishLogin = resolve)));

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(screen.getByRole('button', { name: 'Проверяем…' })).toBeDisabled();

    finishLogin();
    expect(await screen.findByRole('button', { name: 'Войти' })).toBeEnabled();
  });

  it('shows the error message when login fails', async () => {
    const { onSubmit, user } = setup();
    onSubmit.mockRejectedValueOnce(new Error('Неверный apiTokenInstance'));

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Неверный apiTokenInstance');
    expect(screen.getByRole('button', { name: 'Войти' })).toBeEnabled();
  });
});
