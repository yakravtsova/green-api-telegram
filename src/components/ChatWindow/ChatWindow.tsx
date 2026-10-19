import { formatPhone } from '../../lib/phone';
import type { Chat } from '../../state/chatReducer';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  chat: Chat;
}

function ChatWindow({ chat }: ChatWindowProps) {
  return (
    <>
      <header className={styles.header}>
        <h2 className={styles.title}>{formatPhone(chat.phone)}</h2>
        {chat.username && <span className={styles.username}>{chat.username}</span>}
      </header>

      <div className={styles.messages}>
        <p className={styles.empty}>Сообщений пока нет</p>
      </div>

      <form className={styles.composer}>
        <textarea
          className={styles.input}
          name="message"
          rows={1}
          placeholder="Сообщение"
          aria-label="Сообщение"
        />
        <button className={styles.send} type="submit">
          Отправить
        </button>
      </form>
    </>
  );
}

export default ChatWindow;
