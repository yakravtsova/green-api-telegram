import type { Message, MessageStatus } from '../../state/chatReducer';
import styles from './MessageBubble.module.css';

const statusLabels: Record<MessageStatus, string> = {
  sending: 'Отправляется',
  sent: 'Отправлено',
  error: 'Не отправлено',
};

const statusIcons: Record<MessageStatus, string> = {
  sending: '🕓',
  sent: '✓',
  error: '⚠',
};

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isError = message.status === 'error';

  return (
    <li className={isError ? `${styles.bubble} ${styles.error}` : styles.bubble}>
      <p className={styles.text}>{message.text}</p>
      <span className={styles.meta}>
        <time dateTime={new Date(message.timestamp).toISOString()}>
          {formatTime(message.timestamp)}
        </time>
        <span
          role="img"
          aria-label={statusLabels[message.status]}
          title={statusLabels[message.status]}
        >
          {statusIcons[message.status]}
        </span>
      </span>
    </li>
  );
}

export default MessageBubble;
