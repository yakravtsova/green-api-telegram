import { useAuth } from '../../auth/AuthContext';
import { formatPhone } from '../../lib/phone';
import type { Chat } from '../../state/chatReducer';
import NewChatForm from '../NewChatForm/NewChatForm';
import styles from './Sidebar.module.css';

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
          {chats.map(({ chatId, phone, username }) => (
            <li key={chatId}>
              <button
                className={
                  chatId === activeChatId ? `${styles.chat} ${styles.active}` : styles.chat
                }
                type="button"
                aria-current={chatId === activeChatId}
                onClick={() => onSelectChat(chatId)}
              >
                <span className={styles.phone}>{formatPhone(phone)}</span>
                {username && <span className={styles.username}>{username}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export default Sidebar;
