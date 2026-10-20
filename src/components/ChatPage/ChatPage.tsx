import { useCallback, useReducer } from 'react';
import { sendMessage } from '../../api/greenApi';
import type { NotificationBody } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { parseNotification } from '../../notifications/parseNotification';
import { useNotificationsPolling } from '../../notifications/useNotificationsPolling';
import { chatReducer, initialChatState } from '../../state/chatReducer';
import { findChat } from '../../state/findChat';
import ChatWindow from '../ChatWindow/ChatWindow';
import Sidebar from '../Sidebar/Sidebar';
import styles from './ChatPage.module.css';

let localIdCounter = 0;

function createLocalId() {
  localIdCounter += 1;
  return `local-${Date.now()}-${localIdCounter}`;
}

function ChatPage() {
  const { credentials } = useAuth();
  const [{ chats, activeChatId }, dispatch] = useReducer(chatReducer, initialChatState);

  const handleNotification = useCallback((body: NotificationBody) => {
    const received = parseNotification(body);
    if (received) {
      dispatch({ type: 'messageReceived', ...received });
    }
  }, []);

  useNotificationsPolling(credentials, handleNotification);

  const activeChat = chats.find(({ chatId }) => chatId === activeChatId);

  const handleCreateChat = async (phone: string) => {
    if (!credentials) return;
    const contact = await findChat(credentials, phone);
    dispatch({ type: 'chatCreated', contact });
  };

  const handleSendMessage = async (chatId: string, text: string) => {
    if (!credentials) return;

    const id = createLocalId();
    dispatch({
      type: 'messageSending',
      chatId,
      message: { id, direction: 'outgoing', text, timestamp: Date.now(), status: 'sending' },
    });

    try {
      const { idMessage } = await sendMessage(credentials, chatId, text);
      dispatch({ type: 'messageSent', chatId, id, idMessage });
    } catch {
      dispatch({ type: 'messageFailed', chatId, id });
    }
  };

  return (
    <div className={activeChat ? `${styles.page} ${styles.chatOpen}` : styles.page}>
      <Sidebar
        className={styles.sidebar}
        chats={chats}
        activeChatId={activeChatId}
        onCreateChat={handleCreateChat}
        onSelectChat={(chatId) => dispatch({ type: 'chatSelected', chatId })}
      />
      <section className={styles.chat}>
        {activeChat ? (
          <ChatWindow
            chat={activeChat}
            onSend={(text) => handleSendMessage(activeChat.chatId, text)}
            onBack={() => dispatch({ type: 'chatClosed' })}
          />
        ) : (
          <p className={styles.placeholder}>Выберите чат или создайте новый</p>
        )}
      </section>
    </div>
  );
}

export default ChatPage;
