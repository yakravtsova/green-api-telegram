import { useAuth } from '../../auth/AuthContext';
import styles from './Sidebar.module.css';

function Sidebar() {
  const { credentials, logout } = useAuth();

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <span className={styles.instance}>Инстанс {credentials?.idInstance}</span>
        <button className={styles.logout} type="button" onClick={logout}>
          Выйти
        </button>
      </header>

      <form className={styles.newChat}>
        <input
          className={styles.phoneInput}
          name="phone"
          type="tel"
          placeholder="Номер телефона"
          aria-label="Номер телефона"
        />
        <button className={styles.createButton} type="submit">
          Создать чат
        </button>
      </form>

      <p className={styles.empty}>Чатов пока нет</p>
    </aside>
  );
}

export default Sidebar;
