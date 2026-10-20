import { useReducer } from 'react';
import { sendMessage } from '../../api/greenApi';
import { useAuth } from '../../auth/AuthContext';
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
      message: { id, text, timestamp: Date.now(), status: 'sending' },
    });

    try {
      const { idMessage } = await sendMessage(credentials, chatId, text);
      dispatch({ type: 'messageSent', chatId, id, idMessage });
    } catch {
      dispatch({ type: 'messageFailed', chatId, id });
    }
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
          <ChatWindow
            chat={activeChat}
            onSend={(text) => handleSendMessage(activeChat.chatId, text)}
          />
        ) : (
          <p className={styles.placeholder}>Выберите чат или создайте новый</p>
        )}
      </section>
    </div>
  );
}

export default ChatPage;
