import { render, screen } from '@testing-library/react';
import type { Message } from '../../state/chatReducer';
import MessageBubble from './MessageBubble';

const base = { id: '1', text: 'Привет', timestamp: Date.UTC(2026, 0, 1, 9, 5) };

function renderBubble(message: Message) {
  render(
    <ul>
      <MessageBubble message={message} />
    </ul>,
  );
}

describe('MessageBubble', () => {
  it('shows the delivery status of an outgoing message', () => {
    renderBubble({ ...base, direction: 'outgoing', status: 'sent' });

    expect(screen.getByText('Привет')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Отправлено' })).toBeInTheDocument();
  });

  it('shows an incoming message without a status', () => {
    renderBubble({ ...base, direction: 'incoming' });

    expect(screen.getByText('Привет')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
