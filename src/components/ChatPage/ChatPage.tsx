import { useReducer } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { formatPhone } from '../../lib/phone';
import { chatReducer, initialChatState } from '../../state/chatReducer';
import { findChat } from '../../state/findChat';
import Sidebar from '../Sidebar/Sidebar';
import styles from './ChatPage.module.css';

function ChatPage() {
  const { credentials } = useAuth();
  const [{ chats, activeChatId }, dispatch] = useReducer(chatReducer, initialChatState);

  const activeChat = chats.find(({ chatId }) => chatId === activeChatId);

  const handleCreateChat = async (phone: string) => {
    if (!credentials) return;
    const chat = await findChat(credentials, phone);
    dispatch({ type: 'chatCreated', chat });
  };

  return (
    <div className={styles.page}>
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onCreateChat={handleCreateChat}
        onSelectChat={(chatId) => dispatch({ type: 'chatSelected', chatId })}
      />
      <section className={styles.chat}>
        {activeChat ? (
          <header className={styles.chatHeader}>
            <h2 className={styles.chatTitle}>{formatPhone(activeChat.phone)}</h2>
          </header>
        ) : (
          <p className={styles.placeholder}>Выберите чат или создайте новый</p>
        )}
      </section>
    </div>
  );
}

export default ChatPage;
