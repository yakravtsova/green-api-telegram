import { useEffect, useRef } from 'react';
import type { Chat } from '../../state/chatReducer';
import { getChatTitle } from '../../state/getChatTitle';
import MessageBubble from '../MessageBubble/MessageBubble';
import MessageComposer from '../MessageComposer/MessageComposer';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  chat: Chat;
  onSend: (text: string) => void;
  onBack: () => void;
}

function ChatWindow({ chat, onSend, onBack }: ChatWindowProps) {
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chat.chatId, chat.messages.length]);

  return (
    <>
      <header className={styles.header}>
        <button className={styles.back} type="button" aria-label="Назад к чатам" onClick={onBack}>
          ←
        </button>
        <h2 className={styles.title}>{getChatTitle(chat)}</h2>
        {chat.username && <span className={styles.username}>{chat.username}</span>}
      </header>

      <div className={styles.messages} ref={messagesRef}>
        {chat.messages.length === 0 ? (
          <p className={styles.empty}>Сообщений пока нет</p>
        ) : (
          <ul className={styles.list} aria-label="Сообщения">
            {chat.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </ul>
        )}
      </div>

      <MessageComposer key={chat.chatId} onSend={onSend} />
    </>
  );
}

export default ChatWindow;
