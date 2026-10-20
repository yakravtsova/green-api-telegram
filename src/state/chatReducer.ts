export interface Contact {
  chatId: string;
  /** Пустая строка, если номер скрыт */
  phone: string;
  username?: string;
  name?: string;
}

export type MessageDirection = 'incoming' | 'outgoing';

export type MessageStatus = 'sending' | 'sent' | 'error';

export interface Message {
  /** Локальный id: idMessage от сервера появляется только после ответа на sendMessage */
  id: string;
  idMessage?: string;
  direction: MessageDirection;
  text: string;
  timestamp: number;
  /** Только у исходящих */
  status?: MessageStatus;
}

export interface Chat extends Contact {
  messages: Message[];
}

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
}

export type ChatAction =
  | { type: 'chatCreated'; contact: Contact }
  | { type: 'chatSelected'; chatId: string }
  | { type: 'chatClosed' }
  | { type: 'messageSending'; chatId: string; message: Message }
  | { type: 'messageSent'; chatId: string; id: string; idMessage: string }
  | { type: 'messageFailed'; chatId: string; id: string }
  | { type: 'messageReceived'; contact: Contact; message: Message };

export const initialChatState: ChatState = {
  chats: [],
  activeChatId: null,
};

function updateChat(state: ChatState, chatId: string, update: (chat: Chat) => Chat): ChatState {
  return {
    ...state,
    chats: state.chats.map((chat) => (chat.chatId === chatId ? update(chat) : chat)),
  };
}

/** Добавляет сообщение и поднимает чат наверх списка, как в мессенджерах */
function addMessage(state: ChatState, chatId: string, message: Message): ChatState {
  const chat = state.chats.find((current) => current.chatId === chatId);
  if (!chat) return state;

  return {
    ...state,
    chats: [
      { ...chat, messages: [...chat.messages, message] },
      ...state.chats.filter((current) => current !== chat),
    ],
  };
}

function updateMessage(
  state: ChatState,
  chatId: string,
  id: string,
  update: (message: Message) => Message,
): ChatState {
  return updateChat(state, chatId, (chat) => ({
    ...chat,
    messages: chat.messages.map((message) => (message.id === id ? update(message) : message)),
  }));
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'chatCreated': {
      const { contact } = action;
      const exists = state.chats.some(({ chatId }) => chatId === contact.chatId);
      return {
        chats: exists ? state.chats : [{ ...contact, messages: [] }, ...state.chats],
        activeChatId: contact.chatId,
      };
    }
    case 'chatSelected':
      return { ...state, activeChatId: action.chatId };
    case 'chatClosed':
      return { ...state, activeChatId: null };
    case 'messageSending':
      return addMessage(state, action.chatId, action.message);
    case 'messageSent':
      return updateMessage(state, action.chatId, action.id, (message) => ({
        ...message,
        idMessage: action.idMessage,
        status: 'sent',
      }));
    case 'messageFailed':
      return updateMessage(state, action.chatId, action.id, (message) => ({
        ...message,
        status: 'error',
      }));
    case 'messageReceived': {
      const { contact, message } = action;
      const chat = state.chats.find(({ chatId }) => chatId === contact.chatId);

      if (!chat) {
        return { ...state, chats: [{ ...contact, messages: [message] }, ...state.chats] };
      }
      // уведомление может прийти повторно, если deleteNotification не сработал
      if (chat.messages.some(({ idMessage }) => idMessage === message.idMessage)) {
        return state;
      }
      return addMessage(state, contact.chatId, message);
    }
  }
}
