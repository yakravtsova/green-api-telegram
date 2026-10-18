import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

function setup() {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<LoginForm onSubmit={onSubmit} />);
  return { onSubmit, user };
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
});
