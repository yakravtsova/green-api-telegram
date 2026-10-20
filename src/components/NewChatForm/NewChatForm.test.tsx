import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewChatForm from './NewChatForm';

function setup() {
  const onCreate = vi.fn<(phone: string) => Promise<void>>();
  const user = userEvent.setup();
  render(<NewChatForm onCreate={onCreate} />);
  return { onCreate, user, input: screen.getByLabelText('Номер телефона') };
}

describe('NewChatForm', () => {
  it('passes the normalized phone and clears the input after success', async () => {
    const { onCreate, user, input } = setup();
    onCreate.mockResolvedValueOnce();

    await user.type(input, '+7 (900) 123-45-67');
    await user.click(screen.getByRole('button', { name: 'Создать чат' }));

    expect(onCreate).toHaveBeenCalledWith('79001234567');
    expect(input).toHaveValue('');
  });

  it('shows an error for an invalid number without calling onCreate', async () => {
    const { onCreate, user, input } = setup();

    await user.type(input, '12345{Enter}');

    expect(screen.getByRole('alert')).toHaveTextContent(/Введите номер с кодом страны/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveValue('12345');
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('shows the error from onCreate and keeps the number', async () => {
    const { onCreate, user, input } = setup();
    onCreate.mockRejectedValueOnce(new Error('Аккаунт Telegram не найден'));

    await user.type(input, '+7 900 123-45-67{Enter}');

    expect(await screen.findByRole('alert')).toHaveTextContent('Аккаунт Telegram не найден');
    expect(input).toHaveValue('+7 900 123-45-67');
    expect(screen.getByRole('button', { name: 'Создать чат' })).toBeEnabled();
  });

  it('disables the button while the number is being checked', async () => {
    const { onCreate, user, input } = setup();
    let finish = () => {};
    onCreate.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));

    await user.type(input, '+7 900 123-45-67{Enter}');

    expect(screen.getByRole('button', { name: 'Ищем…' })).toBeDisabled();

    finish();
    expect(await screen.findByRole('button', { name: 'Создать чат' })).toBeEnabled();
  });

  it('hides the error when the user edits the number', async () => {
    const { user, input } = setup();

    await user.type(input, '12345{Enter}');
    await user.type(input, '6');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
