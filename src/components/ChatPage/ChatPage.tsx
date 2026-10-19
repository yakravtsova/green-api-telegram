import { useAuth } from '../../auth/AuthContext';
import styles from './ChatPage.module.css';

function ChatPage() {
  const { credentials, logout } = useAuth();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span>Инстанс {credentials?.idInstance}</span>
        <button className={styles.logout} type="button" onClick={logout}>
          Выйти
        </button>
      </header>
    </div>
  );
}

export default ChatPage;
