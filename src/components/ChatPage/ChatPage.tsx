import { useReducer } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { chatReducer, initialChatState } from '../../state/chatReducer';
import { findChat } from '../../state/findChat';
import ChatWindow from '../ChatWindow/ChatWindow';
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
          <ChatWindow chat={activeChat} />
        ) : (
          <p className={styles.placeholder}>Выберите чат или создайте новый</p>
        )}
      </section>
    </div>
  );
}

export default ChatPage;
