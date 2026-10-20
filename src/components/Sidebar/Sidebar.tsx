import { useAuth } from '../../auth/AuthContext';
import type { Chat } from '../../state/chatReducer';
import { getChatTitle } from '../../state/getChatTitle';
import NewChatForm from '../NewChatForm/NewChatForm';
import styles from './Sidebar.module.css';

function getPreview({ messages }: Chat) {
  const last = messages[messages.length - 1];
  if (!last) return '';
  return last.direction === 'outgoing' ? `Вы: ${last.text}` : last.text;
}

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onCreateChat: (phone: string) => Promise<void>;
  onSelectChat: (chatId: string) => void;
}

function Sidebar({ chats, activeChatId, onCreateChat, onSelectChat }: SidebarProps) {
  const { credentials, logout } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <span className={styles.instance}>Инстанс {credentials?.idInstance}</span>
        <button className={styles.logout} type="button" onClick={logout}>
          Выйти
        </button>
      </header>

      <NewChatForm onCreate={onCreateChat} />

      {chats.length === 0 ? (
        <p className={styles.empty}>Чатов пока нет</p>
      ) : (
        <ul className={styles.list}>
          {chats.map((chat) => (
            <li key={chat.chatId}>
              <button
                className={
                  chat.chatId === activeChatId ? `${styles.chat} ${styles.active}` : styles.chat
                }
                type="button"
                aria-current={chat.chatId === activeChatId}
                onClick={() => onSelectChat(chat.chatId)}
              >
                <span className={styles.heading}>
                  <span className={styles.title}>{getChatTitle(chat)}</span>
                  {chat.username && <span className={styles.username}>{chat.username}</span>}
                </span>
                <span className={styles.preview}>{getPreview(chat)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export default Sidebar;
