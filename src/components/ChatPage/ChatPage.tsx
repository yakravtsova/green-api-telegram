import Sidebar from '../Sidebar/Sidebar';
import styles from './ChatPage.module.css';

function ChatPage() {
  return (
    <div className={styles.page}>
      <Sidebar />
      <section className={styles.chat}>
        <p className={styles.placeholder}>Выберите чат или создайте новый</p>
      </section>
    </div>
  );
}

export default ChatPage;
