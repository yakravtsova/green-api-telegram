import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageComposer from './MessageComposer';

function setup() {
  const onSend = vi.fn();
  const user = userEvent.setup();
  render(<MessageComposer onSend={onSend} />);
  return { onSend, user, input: screen.getByLabelText('Сообщение') };
}

describe('MessageComposer', () => {
  it('sends the trimmed text on Enter and clears the field', async () => {
    const { onSend, user, input } = setup();

    await user.type(input, '  Привет  {Enter}');

    expect(onSend).toHaveBeenCalledWith('Привет');
    expect(input).toHaveValue('');
  });

  it('inserts a line break on Shift+Enter instead of sending', async () => {
    const { onSend, user, input } = setup();

    await user.type(input, 'Строка 1{Shift>}{Enter}{/Shift}Строка 2');

    expect(onSend).not.toHaveBeenCalled();
    expect(input).toHaveValue('Строка 1\nСтрока 2');
  });

  it('sends by clicking the button', async () => {
    const { onSend, user, input } = setup();

    await user.type(input, 'Привет');
    await user.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(onSend).toHaveBeenCalledWith('Привет');
  });

  it('does not send an empty or whitespace-only message', async () => {
    const { onSend, user, input } = setup();

    await user.type(input, '   {Enter}');

    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Отправить' })).toBeDisabled();
  });
});
